import React, { useState, useEffect } from "react";
import {
  FaBrain,
  FaDatabase,
  FaPlay,
  FaSync,
  FaCheckCircle,
  FaTimesCircle,
  FaLightbulb,
} from "react-icons/fa";

const MLTraining = () => {
  const [isTraining, setIsTraining] = useState(false);
  const [trainingResult, setTrainingResult] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("numeros");
  const [stats, setStats] = useState(null);

  const categories = {
    numeros: "Números 0-9",
    vocales: "Vocales A, E, I, O, U",
    operaciones: "Operaciones +, -, *, /, =",
    abecedario: "Abecedario A-Z",
  };

  useEffect(() => {
    fetchStats();
  }, [selectedCategory]);

  const fetchStats = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/${selectedCategory}/stats/1`
      );
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error obteniendo estadísticas:", error);
    }
  };

  const trainModel = async () => {
    setIsTraining(true);
    setTrainingResult(null);

    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/${selectedCategory}/train/1`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setTrainingResult(result);
      } else {
        setTrainingResult({
          success: false,
          message: "Error entrenando modelo",
          accuracy: 0,
        });
      }
    } catch (error) {
      setTrainingResult({
        success: false,
        message: `Error de conexión: ${error.message}`,
        accuracy: 0,
      });
    } finally {
      setIsTraining(false);
    }
  };

  return (
    <div className="container my-5">
      {/* 🔹 Hero */}
      <section
        className="text-center text-white p-5 mb-5 rounded shadow"
        style={{
          background: "linear-gradient(90deg, #131C29, #1C2535)",
        }}
      >
        <h1 className="fw-bold">Entrenamiento de Modelo ML</h1>
        <p className="mt-2">
          <FaBrain className="me-2" />
          Entrena modelos de Machine Learning con tus datos de señas
        </p>
      </section>

      {/* 🔹 Selección de Categoría */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-light">
          <h2 className="card-title">Seleccionar Categoría</h2>
        </div>
        <div className="card-body">
          <div className="row g-3">
            {Object.entries(categories).map(([key, name]) => (
              <div key={key} className="col-md-3">
                <div
                  className={`p-4 rounded border text-center h-100 ${
                    selectedCategory === key ? "bg-primary text-white" : "bg-white"
                  }`}
                  style={{ cursor: "pointer", transition: "0.3s" }}
                  onClick={() => setSelectedCategory(key)}
                >
                  <h5 className="fw-bold">{name}</h5>
                  {selectedCategory === key ? (
                    <span className="badge bg-light text-dark mt-2">
                      Seleccionado
                    </span>
                  ) : (
                    <span className="badge bg-secondary mt-2">Seleccionar</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 🔹 Estadísticas */}
      {stats && (
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-light">
            <h2 className="card-title">Estadísticas de Datos</h2>
          </div>
          <div className="card-body">
            <div className="row text-center mb-4">
              <div className="col-md-4">
                <h3 className="text-primary fw-bold">{stats.total_samples || 0}</h3>
                <p>Total Muestras</p>
              </div>
              <div className="col-md-4">
                <h3 className="text-success fw-bold">
                  {Object.keys(stats.signs || {}).length}
                </h3>
                <p>Señas Diferentes</p>
              </div>
              <div className="col-md-4">
                <h3 className="text-info fw-bold">
                  {Object.values(stats.signs || {}).reduce(
                    (sum, sign) => sum + (sign.samples || 0),
                    0
                  )}
                </h3>
                <p>Muestras por Seña</p>
              </div>
            </div>

            <h5 className="fw-bold">📊 Distribución por Seña</h5>
            <div className="row g-2 mt-2">
              {Object.entries(stats.signs || {}).map(([sign, data]) => (
                <div key={sign} className="col-md-2">
                  <div className="border rounded p-2 text-center">
                    <div className="fw-bold">{sign}</div>
                    <small className="text-muted">{data.samples || 0} muestras</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 🔹 Controles de Entrenamiento */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-light">
          <h2 className="card-title">Entrenar Modelo</h2>
        </div>
        <div className="card-body">
          <p className="alert alert-info">
            ℹ️ Usa <strong>Random Forest</strong> para clasificar señas.
            Necesitas al menos <strong>10 muestras</strong> para entrenar.
          </p>
          <div className="d-flex gap-3">
            <button
              onClick={trainModel}
              disabled={isTraining || !stats || stats.total_samples < 10}
              className="btn btn-primary flex-grow-1"
            >
              {isTraining ? "⏳ Entrenando..." : "🚀 Entrenar Modelo"}
            </button>
            <button onClick={fetchStats} className="btn btn-outline-secondary">
              <FaSync className="me-2" /> Actualizar
            </button>
          </div>
          {!stats || stats.total_samples < 10 ? (
            <p className="alert alert-warning mt-3">
              ⚠️ Datos insuficientes. Ve a <strong>Recolección de Datos</strong> para agregar más muestras.
            </p>
          ) : null}
        </div>
      </div>

      {/* 🔹 Resultados */}
      {trainingResult && (
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-light">
            <h2 className="card-title">Resultados</h2>
          </div>
          <div className="card-body">
            <div
              className={`alert ${
                trainingResult.success ? "alert-success" : "alert-danger"
              }`}
            >
              {trainingResult.success ? (
                <>
                  <FaCheckCircle className="me-2" />
                  Entrenamiento Exitoso ✅
                </>
              ) : (
                <>
                  <FaTimesCircle className="me-2" />
                  Error en Entrenamiento ❌
                </>
              )}
              <p className="mt-2">{trainingResult.message}</p>
            </div>

            {trainingResult.success && (
              <>
                <div className="row text-center mt-3">
                  <div className="col-md-4">
                    <h4 className="text-success fw-bold">
                      {(trainingResult.accuracy * 100).toFixed(1)}%
                    </h4>
                    <p>Precisión</p>
                  </div>
                  <div className="col-md-4">
                    <h4 className="text-primary fw-bold">
                      {trainingResult.samples}
                    </h4>
                    <p>Muestras</p>
                  </div>
                  <div className="col-md-4">
                    <h4 className="text-info fw-bold">
                      {trainingResult.classes?.length || 0}
                    </h4>
                    <p>Clases</p>
                  </div>
                </div>

                <div className="mt-3">
                  <h5 className="fw-bold">Clases entrenadas:</h5>
                  <div className="d-flex flex-wrap gap-2 mt-2">
                    {trainingResult.classes?.map((cls, i) => (
                      <span key={i} className="badge bg-primary">
                        {cls}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 🔹 Tips */}
      <div className="card shadow-sm">
        <div className="card-header bg-light">
          <h2 className="card-title">Consejos para Mejor Entrenamiento</h2>
        </div>
        <div className="card-body row">
          <div className="col-md-6">
            <h5 className="fw-bold">
              <FaDatabase className="me-2" /> Datos
            </h5>
            <ul className="text-muted">
              <li>✔ Mínimo 5 muestras por seña</li>
              <li>✔ Variedad en ángulos y posiciones</li>
              <li>✔ Buena iluminación</li>
              <li>✔ Gestos claros</li>
            </ul>
          </div>
          <div className="col-md-6">
            <h5 className="fw-bold">
              <FaLightbulb className="me-2" /> Modelo
            </h5>
            <ul className="text-muted">
              <li>✔ Random Forest robusto</li>
              <li>✔ Entrenamiento automático</li>
              <li>✔ Validación cruzada</li>
              <li>✔ Guardado automático</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MLTraining;
