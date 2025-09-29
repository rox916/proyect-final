// Prediction.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HeroNavbar from "../components/HeroNavbar";
import Footer from "../components/Footer";

// Imagen fija
import abecedarioImg from "../assets/abecedario.png";

// Íconos
import { FaHands, FaChartLine, FaCheckCircle } from "react-icons/fa";

// 🔹 Importar AOS
import AOS from "aos";
import "aos/dist/aos.css";

const Prediction = () => {
  const navigate = useNavigate();
  const [availableModels, setAvailableModels] = useState([]);
  const [modelsLoading, setModelsLoading] = useState(true);

  // 🔹 Inicializar AOS
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  // 🔹 Cargar modelos desde el backend
  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    setModelsLoading(true);
    try {
      const categories = ["numeros", "operaciones", "abecedario"];
      const models = [];

      for (const category of categories) {
        try {
          let statsResponse;

          if (category === "operaciones") {
            statsResponse = await fetch(
              `http://localhost:8000/api/v1/operaciones/training-status/1`
            );
          } else {
            statsResponse = await fetch(
              `http://localhost:8000/api/v1/${category}/stats/1`
            );
          }

          if (statsResponse.ok) {
            const stats = await statsResponse.json();
            const hasData = stats.total_samples > 0;

            models.push({
              id: models.length + 1,
              name:
                category === "operaciones"
                  ? "Modelo Operaciones Matemáticas"
                  : `Modelo ${category.charAt(0).toUpperCase() + category.slice(1)}`,
              category,
              samples: stats.total_samples || 0,
              status: hasData ? "ready_to_train" : "no_data",
            });
          }
        } catch (error) {
          console.error(`Error cargando ${category}:`, error);
        }
      }

      setAvailableModels(models);
    } catch (error) {
      console.error("Error cargando modelos:", error);
    } finally {
      setModelsLoading(false);
    }
  };

  return (
    <div className="prediction-page">
      {/* 🔹 Navbar */}
      <HeroNavbar />

      {/* 🔹 Hero Section */}
      <section
        className="text-center text-white d-flex flex-column justify-content-center align-items-center"
        style={{
          minHeight: "40vh",
          background: "linear-gradient(90deg, #131C29, #1C2535)",
        }}
        data-aos="fade-down"  // 👈 Animación al entrar
      >
        <h1 className="display-5 fw-bold">Predicción en Tiempo Real</h1>
        <p className="lead mt-2">
          Reconoce señas en tiempo real con feedback visual y vocal
        </p>
      </section>

      {/* 🔹 Selección de Modelo */}
      <section className="container my-5" data-aos="fade-up">
        <h2 className="fw-bold text-center mb-4">Selecciona un Modelo</h2>

        {modelsLoading ? (
          <div className="text-center py-5" data-aos="zoom-in">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="text-muted mt-3">Cargando modelos...</p>
          </div>
        ) : (
          <div className="row g-4">
            {availableModels.map((model, i) => {
              const bgImage = abecedarioImg;

              return (
                <div key={model.id} className="col-md-4" data-aos="zoom-in" data-aos-delay={i * 150}>
                  <div
                    className="card model-card shadow-sm position-relative overflow-hidden"
                    style={{
                      backgroundImage: `url(${bgImage})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      height: "250px",
                      borderRadius: "12px",
                      cursor: "pointer",
                    }}
                    onClick={() => navigate(`/prediction/${model.category}`)}
                  >
                    {/* Overlay con datos */}
                    <div className="overlay d-flex flex-column justify-content-center align-items-center text-center p-3">
                      <h5 className="fw-bold text-white">{model.name}</h5>
                      <p className="text-white-50 small mb-1">
                        Precisión: {(model.accuracy * 100).toFixed(1)}% <br />
                        Muestras: {model.samples}
                      </p>
                      <span
                        className={`badge ${
                          model.status === "trained"
                            ? "bg-success"
                            : model.status === "ready_to_train"
                            ? "bg-warning text-dark"
                            : "bg-secondary"
                        }`}
                      >
                        {model.status === "trained"
                          ? "✅ Entrenado"
                          : model.status === "ready_to_train"
                          ? "⚠️ Listo para entrenar"
                          : "❌ Sin datos"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 🔹 Cómo Funciona */}
      <section className="container my-5" data-aos="fade-up">
        <h2 className="fw-bold text-center mb-4">¿Cómo Funciona?</h2>
        <div className="row g-4 text-center">
          <div className="col-md-4" data-aos="fade-up" data-aos-delay="100">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">
                <FaHands size={40} className="text-primary mb-3" />
                <h5 className="fw-bold">Detección de Mano</h5>
                <p className="text-muted">
                  Identifica tu mano y sus puntos clave usando MediaPipe.
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4" data-aos="fade-up" data-aos-delay="200">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">
                <FaChartLine size={40} className="text-success mb-3" />
                <h5 className="fw-bold">Predicción</h5>
                <p className="text-muted">
                  Compara tu seña con los datos del modelo entrenado y muestra
                  resultados confiables.
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4" data-aos="fade-up" data-aos-delay="300">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">
                <FaCheckCircle size={40} className="text-warning mb-3" />
                <h5 className="fw-bold">Feedback en Tiempo Real</h5>
                <p className="text-muted">
                  Recibe confirmación visual y auditiva para mejorar la
                  experiencia de uso.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🔹 Detalles del Sistema */}
      <section className="my-5 system-details" data-aos="fade-up">
        <h2 className="fw-bold text-center mb-4">Detalles del Sistema</h2>
        <div className="row g-3 justify-content-center">
          <div className="col-12 col-md-5" data-aos="zoom-in" data-aos-delay="100">
            <div className="card shadow-sm border-0 h-100 text-center p-4">
              <div className="mb-3">
                <i className="fas fa-chart-line fa-2x text-success"></i>
              </div>
              <h5 className="fw-bold text-success">📊 Estado Actual</h5>
              <ul className="text-muted list-unstyled mt-3">
                <li>✔ Detecta tu mano correctamente (MediaPipe)</li>
                <li>✔ Predicciones basadas en tus datos (landmarks)</li>
                <li>✔ Confianza real basada en similitud con datos entrenados</li>
              </ul>
            </div>
          </div>

          <div className="col-12 col-md-5" data-aos="zoom-in" data-aos-delay="200">
            <div className="card shadow-sm border-0 h-100 text-center p-4">
              <div className="mb-3">
                <i className="fas fa-volume-up fa-2x text-info"></i>
              </div>
              <h5 className="fw-bold text-info">🔊 Audio Actual</h5>
              <ul className="text-muted list-unstyled mt-3">
                <li>✔ Habla solo cuando detecta mano</li>
                <li>✔ Mensajes cortos y claros</li>
                <li>✔ Voz rápida y natural</li>
                <li>✔ Basado en datos reales</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 🔹 Footer */}
      <Footer />
    </div>
  );
};

export default Prediction;
