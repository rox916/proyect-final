// PredictionInterface.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import MediaPipeCamera from "../components/MediaPipeCamera";
import HeroNavbar from "../components/HeroNavbar";

const PredictionInterface = () => {
  const { model } = useParams(); // modelo que viene desde la URL

  const [isPredicting, setIsPredicting] = useState(false);
  const [currentPrediction, setCurrentPrediction] = useState(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [aiFeedback, setAiFeedback] = useState("");
  const [isHandDetected, setIsHandDetected] = useState(false);
  const [landmarks, setLandmarks] = useState(null);
  const [lastPredictionTime, setLastPredictionTime] = useState(0);
  const [handStableTime, setHandStableTime] = useState(0);
  const [bothHandsDetected, setBothHandsDetected] = useState(false);
  const [dualHandMode, setDualHandMode] = useState(false); // Nueva opción para el usuario

  // Función para cambiar el modo de detección
  const handleModeChange = (isDualHand) => {
    setDualHandMode(isDualHand);
    // Resetear estados cuando se cambie el modo
    setHandStableTime(0);
    setLastPredictionTime(0);
    setCurrentPrediction(null);
    setAiFeedback(isDualHand ? "Modo de dos manos activado" : "Modo de una mano activado");
  };

  // 🔹 Predicciones
  useEffect(() => {
    const now = Date.now();
    if (!isPredicting || !model) return;

    // Usar la opción del usuario para determinar si requiere ambas manos
    const canPredict = dualHandMode ? bothHandsDetected : isHandDetected;
    
    // Si no se detecta la mano, limpiar la predicción
    if (!canPredict) {
      setCurrentPrediction(null);
      setHandStableTime(0);
      return;
    }
    
    if (canPredict && landmarks && landmarks.length === 21) {
      if (handStableTime === 0) {
        setHandStableTime(now);
        return;
      }
      if (now - handStableTime < 200) return;
      if (now - lastPredictionTime < 300) return;

      setLastPredictionTime(now);
      predictWithBackend(landmarks, model);
    }
  }, [landmarks, isHandDetected, bothHandsDetected, isPredicting, model]);

  const predictWithBackend = async (landmarks, category) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/${category}/predict/1`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(landmarks),
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
                    onHandDetected={setIsHandDetected}
                    dualHandMode={dualHandMode}
                    onDualHandDetected={setBothHandsDetected}
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
                <h5 className="fw-bold mb-3">Configuración de Detección</h5>
                
                {/* Selector de modo de detección */}
                <div className="mb-3">
                  <label className="form-label fw-bold">Modo de Detección:</label>
                  <div className="d-grid gap-2">
                    <button
                      className={`btn ${!dualHandMode ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => handleModeChange(false)}
                    >
                      👋 Una Mano
                    </button>
                    
                    <button
                      className={`btn ${dualHandMode ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => handleModeChange(true)}
                    >
                      🤲 Dos Manos
                    </button>
                  </div>
                  <small className="text-muted">
                    {dualHandMode 
                      ? "Detecta ambas manos para mayor precisión" 
                      : "Detecta una sola mano para mayor flexibilidad"
                    }
                  </small>
                  
                  {/* Consejos para el usuario */}
                  <div className="mt-2">
                    <small className="text-info">
                      💡 <strong>Consejos:</strong><br/>
                      • <strong>Una mano:</strong> Más fácil de usar, ideal para principiantes<br/>
                      • <strong>Dos manos:</strong> Mayor precisión, ideal para gestos complejos
                    </small>
                  </div>
                </div>

                <h5 className="fw-bold mb-3">Estado del Sistema</h5>
                <p>
                  Estado:{" "}
                  {isPredicting ? (
                    <span className="text-success fw-bold">Activo ✅</span>
                  ) : (
                    <span className="text-danger fw-bold">Inactivo ❌</span>
                  )}
                </p>
                {dualHandMode ? (
                  <p>
                    Ambas manos:{" "}
                    {bothHandsDetected ? (
                      <span className="text-success">Detectadas 🤲</span>
                    ) : (
                      <span className="text-warning">Esperando...</span>
                    )}
                  </p>
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

      </section>
    </div>
  );
};

export default PredictionInterface;
