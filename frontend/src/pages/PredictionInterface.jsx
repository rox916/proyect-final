// PredictionInterface.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import MediaPipeCamera from "../components/MediaPipeCamera";
import HeroNavbar from "../components/HeroNavbar";
import { FaHistory } from "react-icons/fa";

const PredictionInterface = () => {
  const { model } = useParams(); // modelo que viene desde la URL

  const [isPredicting, setIsPredicting] = useState(false);
  const [currentPrediction, setCurrentPrediction] = useState(null);
  const [predictionHistory, setPredictionHistory] = useState([]);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [aiFeedback, setAiFeedback] = useState("");
  const [isHandDetected, setIsHandDetected] = useState(false);
  const [landmarks, setLandmarks] = useState(null);
  const [landmarksLeft, setLandmarksLeft] = useState(null);
  const [landmarksRight, setLandmarksRight] = useState(null);
  const [bothHandsDetected, setBothHandsDetected] = useState(false);
  const [lastPredictionTime, setLastPredictionTime] = useState(0);
  const [handStableTime, setHandStableTime] = useState(0);

  // Determinar si la categoría actual requiere dos manos
  const requiresTwoHands = model === 'numeros' || model === 'operaciones';

  // Funciones para manejar detección de manos
  const handleHandDetected = (detected) => {
    setIsHandDetected(detected);
  };

  const handleTwoHands = (leftLandmarks, rightLandmarks) => {
    setLandmarksLeft(leftLandmarks);
    setLandmarksRight(rightLandmarks);
    setBothHandsDetected(true);
    // También actualizar el estado de detección de mano individual
    setLandmarks(leftLandmarks); // Usar mano izquierda como principal
    setIsHandDetected(true);
  };

  // 🔹 Predicciones
  useEffect(() => {
    const now = Date.now();
    if (!isPredicting || !model) return;

    // Verificar condiciones según el tipo de categoría
    const hasValidLandmarks = requiresTwoHands 
      ? (bothHandsDetected && landmarksLeft && landmarksRight && 
         landmarksLeft.length === 21 && landmarksRight.length === 21)
      : (isHandDetected && landmarks && landmarks.length === 21);

    if (hasValidLandmarks) {
      if (handStableTime === 0) {
        setHandStableTime(now);
        return;
      }
      if (now - handStableTime < 500) return;
      if (now - lastPredictionTime < 1000) return;

      setLastPredictionTime(now);
      
      // Enviar los landmarks apropiados según el tipo
      if (requiresTwoHands) {
        predictWithBackend(landmarksLeft, model, landmarksLeft, landmarksRight);
      } else {
        predictWithBackend(landmarks, model);
      }
    }
  }, [landmarks, landmarksLeft, landmarksRight, isHandDetected, bothHandsDetected, isPredicting, model, requiresTwoHands]);

  const predictWithBackend = async (landmarks, category, landmarksLeft = null, landmarksRight = null) => {
    try {
      // Preparar el cuerpo de la petición según el tipo
      let requestBody;
      if (requiresTwoHands && landmarksLeft && landmarksRight) {
        requestBody = {
          landmarks: landmarksLeft,
          landmarks_left: landmarksLeft,
          landmarks_right: landmarksRight
        };
      } else {
        requestBody = landmarks;
      }

      const response = await fetch(
        `http://localhost:8000/api/v1/${category}/predict/1`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        }
      );

      if (response.ok) {
        const result = await response.json();
        const predictionResult = {
          prediction: result.prediction,
          confidence: result.confidence,
          timestamp: result.timestamp,
          model: category,
        };
        setCurrentPrediction(predictionResult);
        setPredictionHistory((prev) => [predictionResult, ...prev.slice(0, 9)]);
      }
    } catch {
      setCurrentPrediction({
        prediction: "Error de conexión",
        confidence: 0,
        timestamp: new Date().toISOString(),
      });
    }
  };

  const startPrediction = () => {
    if (!model) {
      setAiFeedback("Por favor, selecciona un modelo para hacer predicciones.");
      return;
    }
    setIsPredicting(true);
    setAiFeedback("Predicción iniciada.");
  };

  const stopPrediction = () => {
    setIsPredicting(false);
    setCurrentPrediction(null);
  };

  return (
    <div>
      <HeroNavbar />
      <section className="container my-5">
        <h2 className="fw-bold text-center mb-4">
          Interfaz de Predicción - {model}
        </h2>

        {/* 🔹 Cámara + Estado */}
        <div className="row g-4">
          <div className="col-md-7">
            <div className="card shadow-sm">
              <div className="card-body">
                {isPredicting ? (
                  <MediaPipeCamera
                    onLandmarks={setLandmarks}
                    onHandDetected={handleHandDetected}
                    onTwoHands={handleTwoHands}
                    requiresTwoHands={requiresTwoHands}
                  />
                ) : (
                  <p className="text-muted text-center">
                    Inicia la predicción para usar la cámara
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="col-md-5">
            <div className="card shadow-sm">
              <div className="card-body text-center">
                <h5 className="fw-bold mb-3">Estado del Sistema</h5>
                <p>
                  Estado:{" "}
                  {isPredicting ? (
                    <span className="text-success fw-bold">Activo ✅</span>
                  ) : (
                    <span className="text-danger fw-bold">Inactivo ❌</span>
                  )}
                </p>
                {requiresTwoHands ? (
                  <div>
                    <p>
                      Mano Izquierda:{" "}
                      {landmarksLeft ? (
                        <span className="text-success">✅ Detectada</span>
                      ) : (
                        <span className="text-muted">⏳ Esperando</span>
                      )}
                    </p>
                    <p>
                      Mano Derecha:{" "}
                      {landmarksRight ? (
                        <span className="text-success">✅ Detectada</span>
                      ) : (
                        <span className="text-muted">⏳ Esperando</span>
                      )}
                    </p>
                    <p>
                      Estado:{" "}
                      {bothHandsDetected ? (
                        <span className="text-success fw-bold">Listo para predecir 🤟</span>
                      ) : (
                        <span className="text-warning">Esperando ambas manos</span>
                      )}
                    </p>
                  </div>
                ) : (
                  <p>
                    Mano:{" "}
                    {isHandDetected ? (
                      <span className="text-success">Detectada 👋</span>
                    ) : (
                      <span className="text-muted">No detectada</span>
                    )}
                  </p>
                )}
                <div className="d-grid gap-2 mt-3">
                  {!isPredicting ? (
                    <button
                      className="btn btn-success"
                      onClick={startPrediction}
                      disabled={!model}
                    >
                      Iniciar Predicción
                    </button>
                  ) : (
                    <button className="btn btn-danger" onClick={stopPrediction}>
                      Detener
                    </button>
                  )}
                  <button
                    onClick={() => setAudioEnabled(!audioEnabled)}
                    className={`btn ${
                      audioEnabled ? "btn-warning" : "btn-secondary"
                    }`}
                  >
                    {audioEnabled ? "Desactivar Audio" : "Activar Audio"}
                  </button>
                </div>
              </div>
            </div>

            {currentPrediction && (
              <div className="alert alert-info mt-3">
                <h6 className="fw-bold">Última Predicción</h6>
                <p>
                  {currentPrediction.prediction} —{" "}
                  {(currentPrediction.confidence * 100).toFixed(1)}%
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 🔹 Historial */}
        {predictionHistory.length > 0 && (
          <section className="mt-5">
            <h2 className="fw-bold text-center mb-4">
              <FaHistory className="me-2" /> Historial de Predicciones
            </h2>
            <div className="card shadow-sm">
              <div className="card-body">
                {predictionHistory.map((p, i) => (
                  <div
                    key={i}
                    className="d-flex justify-content-between border-bottom py-2"
                  >
                    <span>
                      <strong>{p.prediction}</strong> ({p.model})
                    </span>
                    <span className="text-muted">
                      {(p.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </section>
    </div>
  );
};

export default PredictionInterface;
