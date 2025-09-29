import React, { useState, useEffect } from "react";
import HeroNavbar from "../components/HeroNavbar";
import Footer from "../components/Footer";

const Analytics = () => {
  const [analytics, setAnalytics] = useState({
    totalCategories: 0,
    totalSamples: 0,
    totalModels: 0,
    averageAccuracy: 0,
    categoryDistribution: {},
    accuracyEvolution: [],
    recommendations: []
  });

  const [selectedTimeframe, setSelectedTimeframe] = useState("week");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    // Simular carga de datos
    setAnalytics({
      totalCategories: 3,
      totalSamples: 150,
      totalModels: 2,
      averageAccuracy: 0.89,
      categoryDistribution: {
        vocales: 50,
        numeros: 40,
        operaciones: 60
      },
      accuracyEvolution: [
        { date: "2024-01-01", accuracy: 0.75 },
        { date: "2024-01-02", accuracy: 0.82 },
        { date: "2024-01-03", accuracy: 0.85 },
        { date: "2024-01-04", accuracy: 0.88 },
        { date: "2024-01-05", accuracy: 0.89 }
      ],
      recommendations: [
        "Añade más muestras a la categoría 'Números' para mejorar la precisión",
        "Considera reentrenar el modelo de 'Operaciones' con datos más diversos",
        "La categoría 'Vocales' tiene excelente rendimiento"
      ]
    });
  }, []);

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 0.9) return "text-success";
    if (accuracy >= 0.8) return "text-warning";
    return "text-danger";
  };

  return (
    <div>
      {/* 🔹 Navbar */}
      <HeroNavbar />

      <main className="container my-5">
        {/* Header */}
        <div className="text-center mb-5">
          <h1 className="fw-bold">📊 Analíticas y Métricas</h1>
          <p className="text-muted">
            Visualiza el rendimiento de tus modelos y la calidad de los datos
          </p>
        </div>

        {/* Filtros */}
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-body d-flex flex-wrap gap-4">
            <div>
              <label className="form-label fw-bold">Período:</label>
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="form-select"
              >
                <option value="week">Última semana</option>
                <option value="month">Último mes</option>
                <option value="year">Último año</option>
              </select>
            </div>
            <div>
              <label className="form-label fw-bold">Categoría:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="form-select"
              >
                <option value="all">Todas</option>
                <option value="vocales">Vocales</option>
                <option value="numeros">Números</option>
                <option value="operaciones">Operaciones</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Resumen */}
        <div className="row g-4 mb-4">
          <div className="col-md-3">
            <div className="card text-center shadow-sm border-0">
              <div className="card-body">
                <h3 className="fw-bold text-primary">{analytics.totalCategories}</h3>
                <p className="text-muted">Categorías</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-center shadow-sm border-0">
              <div className="card-body">
                <h3 className="fw-bold text-success">{analytics.totalSamples}</h3>
                <p className="text-muted">Muestras</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-center shadow-sm border-0">
              <div className="card-body">
                <h3 className="fw-bold text-warning">{analytics.totalModels}</h3>
                <p className="text-muted">Modelos</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-center shadow-sm border-0">
              <div className="card-body">
                <h3
                  className={`fw-bold ${getAccuracyColor(
                    analytics.averageAccuracy
                  )}`}
                >
                  {(analytics.averageAccuracy * 100).toFixed(1)}%
                </h3>
                <p className="text-muted">Precisión Promedio</p>
              </div>
            </div>
          </div>
        </div>

        {/* Distribución de Categorías */}
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-header bg-light">
            <h5 className="mb-0">📂 Distribución de Muestras</h5>
          </div>
          <div className="card-body">
            {Object.entries(analytics.categoryDistribution).map(
              ([category, count]) => (
                <div key={category} className="mb-3">
                  <div className="d-flex justify-content-between">
                    <span className="fw-semibold text-capitalize">{category}</span>
                    <span>{count}</span>
                  </div>
                  <div className="progress" style={{ height: "8px" }}>
                    <div
                      className="progress-bar bg-primary"
                      role="progressbar"
                      style={{
                        width: `${
                          (count /
                            Math.max(
                              ...Object.values(analytics.categoryDistribution)
                            )) *
                          100
                        }%`
                      }}
                    ></div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        {/* Evolución Precisión */}
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-header bg-light">
            <h5 className="mb-0">📈 Evolución de Precisión</h5>
          </div>
          <div className="card-body d-flex align-items-end gap-3">
            {analytics.accuracyEvolution.map((point, index) => (
              <div key={index} className="text-center">
                <div
                  className="bg-primary rounded-top mx-auto"
                  style={{
                    height: `${point.accuracy * 200}px`,
                    width: "40px"
                  }}
                ></div>
                <small className="d-block mt-1 text-muted">
                  {(point.accuracy * 100).toFixed(0)}%
                </small>
                <small className="text-muted">
                  {new Date(point.date).toLocaleDateString()}
                </small>
              </div>
            ))}
          </div>
        </div>

        {/* Rendimiento + Recomendaciones */}
        <div className="row g-4 mb-4">
          <div className="col-md-6">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-light">
                <h5 className="mb-0">⚙️ Rendimiento por Modelo</h5>
              </div>
              <div className="card-body">
                <ul className="list-unstyled mb-0">
                  <li className="mb-3">
                    <strong>Modelo Vocales</strong> – <span className="text-success">95%</span>
                    <div className="progress">
                      <div className="progress-bar bg-success" style={{ width: "95%" }}></div>
                    </div>
                  </li>
                  <li className="mb-3">
                    <strong>Modelo Números</strong> – <span className="text-warning">87%</span>
                    <div className="progress">
                      <div className="progress-bar bg-warning" style={{ width: "87%" }}></div>
                    </div>
                  </li>
                  <li>
                    <strong>Modelo Operaciones</strong> – <span className="text-success">92%</span>
                    <div className="progress">
                      <div className="progress-bar bg-success" style={{ width: "92%" }}></div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-light">
                <h5 className="mb-0">🤖 Recomendaciones de IA</h5>
              </div>
              <div className="card-body">
                <ul className="list-unstyled mb-0">
                  {analytics.recommendations.map((rec, i) => (
                    <li key={i} className="mb-2">
                      <span className="badge bg-primary me-2">{i + 1}</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Calidad de Datos */}
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-header bg-light">
            <h5 className="mb-0">📌 Calidad de los Datos</h5>
          </div>
          <div className="card-body row text-center">
            <div className="col-md-4">
              <h4 className="text-success fw-bold">98%</h4>
              <p className="text-muted">Muestras Válidas</p>
            </div>
            <div className="col-md-4">
              <h4 className="text-warning fw-bold">12%</h4>
              <p className="text-muted">Duplicadas</p>
            </div>
            <div className="col-md-4">
              <h4 className="text-primary fw-bold">85%</h4>
              <p className="text-muted">Calidad Promedio</p>
            </div>
          </div>
        </div>

        {/* Exportación */}
        <div className="card shadow-sm border-0 mb-5">
          <div className="card-header bg-light">
            <h5 className="mb-0">📤 Exportar Datos</h5>
          </div>
          <div className="card-body d-flex flex-wrap gap-3">
            <button className="btn btn-primary">📊 Exportar Analíticas</button>
            <button className="btn btn-outline-primary">📈 Exportar Gráficos</button>
            <button className="btn btn-outline-secondary">📋 Exportar Reporte</button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Analytics;
