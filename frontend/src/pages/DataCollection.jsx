import React, { useState } from 'react'
import MediaPipeCamera from '../components/MediaPipeCamera'
import AIAgent from '../components/AIAgent'
import { useStats } from '../hooks/useStats'
import HeroNavbar from "../components/HeroNavbar";
import Footer from "../components/Footer";

const DataCollection = () => {
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [currentStep, setCurrentStep] = useState('setup')
  const [selectedCategory, setSelectedCategory] = useState('vocales')
  const [currentSign, setCurrentSign] = useState('A')
  const [samples, setSamples] = useState([])
  const [isCapturing, setIsCapturing] = useState(false)
  const [captureCount, setCaptureCount] = useState(0)
  const [aiMessage, setAiMessage] = useState('')
  const [isHandDetected, setIsHandDetected] = useState(false)
  const [landmarks, setLandmarks] = useState(null)
  
  // Cargar estadísticas del backend
  const { stats, loading: statsLoading, refetch: refetchStats } = useStats(selectedCategory)

  const categories = {
    vocales: ['A', 'E', 'I', 'O', 'U'],
    abecedario: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
    numeros: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    operaciones: ['+', '-', '*', '/', '='],
    algebraicas: ['x', 'y', 'z', '(', ')', '^']
  }

  const handleLandmarks = (newLandmarks) => {
    setLandmarks(newLandmarks)
  }

  const handleHandDetected = (detected) => {
    setIsHandDetected(detected)
  }

  const captureSample = async () => {
    if (landmarks && landmarks.length === 21) {
      const newSample = {
        landmarks: landmarks,
        category_name: currentSign,
        timestamp: new Date().toISOString()
      }
      
      try {
        // Enviar al backend
        const response = await fetch(`http://localhost:8000/api/v1/${selectedCategory}/samples/1`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newSample)
        })
        
        if (response.ok) {
          const savedSample = await response.json()
          setSamples([...samples, savedSample])
          setCaptureCount(captureCount + 1)
          setAiMessage(`Muestra ${captureCount + 1} capturada para la letra ${currentSign}. ¡Excelente!`)
          
          // Refrescar estadísticas
          refetchStats()
        } else {
          setAiMessage('Error al guardar la muestra. Inténtalo de nuevo.')
        }
      } catch (error) {
        console.error('Error enviando muestra:', error)
        setAiMessage('Error de conexión. Verifica que el backend esté funcionando.')
      }
    } else {
      setAiMessage('Por favor, asegúrate de que tu mano esté visible y realiza la seña correctamente.')
    }
  }

  const nextStep = () => {
    if (currentStep === 'setup') {
      setCurrentStep('capture')
    } else if (currentStep === 'capture') {
      setCurrentStep('review')
    } else if (currentStep === 'review') {
      setCurrentStep('complete')
    }
  }

  const resetCollection = () => {
    setCurrentStep('setup')
    setSamples([])
    setCaptureCount(0)
    setCurrentSign(categories[selectedCategory][0])
    setAiMessage('')
  }

  return (
    <div className="space-y-6">
      {/* 🔹 Navbar siempre visible */}
      <HeroNavbar />

      {/* 🔹 Header y asistente SOLO en setup */}
      {currentStep === "setup" && (
        <section className="container my-5">
          <h2 className="fw-bold text-center mb-4">Recolección de Datos</h2>
          <p className="text-center text-muted mb-5">
            Captura muestras de señas para entrenar tu modelo
          </p>
          <AIAgent
            type="welcome"
            userId={1}
            categoryName={selectedCategory}
            onMessage={setAiMessage}
          />
        </section>
      )}


      {/* Setup Step */}
      {currentStep === "setup" && (
        <section className="py-5 bg-light">
          <div className="container">
            <div className="text-center mb-5">
              <h2 className="fw-bold">⚙️ Configuración</h2>
              <p className="text-muted">Selecciona la categoría de señas que quieres entrenar</p>
            </div>  

            <div className="d-flex justify-content-center flex-wrap gap-4">
              {Object.entries(categories)
                .filter(([key]) => key !== "vocales" && key !== "algebraicas")
                .map(([key, signs]) => (
                  <div
                    key={key}
                    className="card shadow-sm border-0"
                    style={{ width: "260px", borderRadius: "12px" }}
                  >
                    <div className="card-body d-flex flex-column justify-content-between">
                      <div>
                        <h5 className="fw-bold text-capitalize">{key}</h5>
                        <p className="text-muted small mb-2">
                          {key === "abecedario"
                            ? "A-Z completo"
                            : signs.slice(0, 6).join(", ") + (signs.length > 6 ? "..." : "")}
                        </p>
                        <span className="badge bg-info text-white mb-3">
                          {signs.length} señas disponibles
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedCategory(key);
                          setCurrentSign(signs[0]);
                        }}
                        className={`btn w-100 ${
                          selectedCategory === key ? "btn-primary" : "btn-outline-primary"
                        }`}
                      >
                        {selectedCategory === key ? "✅ Seleccionado" : "Seleccionar"}
                      </button>
                    </div>
                  </div>
                ))}
            </div>

            <div className="text-center mt-5">
              <button className="btn btn-success btn-lg px-5" onClick={nextStep}>
                🚀 Iniciar Captura
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Capture Step */}
      {currentStep === 'capture' && (
        <div className="container-fluid my-4 px-4">
          <div className="row justify-content-center">
            <div className="col-lg-10 col-xl-9">
              <div className="card shadow-lg border-0 rounded-3">
                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center gap-3">
                    <button
                      onClick={() => setCurrentStep("setup")}
                      className="btn btn-outline-secondary btn-sm"
                    >
                      ⬅ Volver
                    </button>
                    <div>
                      <h2 className="card-title fw-bold mb-0">📸 Captura de Datos</h2>
                      <small className="text-muted">
                        Capturando: <strong>{currentSign}</strong> | Muestras: <strong>{captureCount}</strong>
                      </small>
                    </div>
                  </div>
                  <span className="badge bg-primary px-3 py-2">
                    {selectedCategory.toUpperCase()}
                  </span>
                </div>

                <div className="card-body">
                  <div className="row g-4">
                    <div className="col-md-8">
                      <div className="card shadow-sm border-0 rounded-3 h-100">
                        <div className="card-body text-center">
                          {isCameraOn ? (
                            <MediaPipeCamera
                              onLandmarks={handleLandmarks}
                              onHandDetected={handleHandDetected}
                            />
                          ) : (
                            <p className="text-muted">📷 Cámara apagada</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="col-md-4 d-flex flex-column gap-3">
                      <div className="card border-0 shadow-sm rounded-3">
                        <div className="card-body">
                          <h5 className="fw-bold mb-3">⚡ Estado de Captura</h5>
                          <div className="mb-2 d-flex justify-content-between">
                            <span>Seña actual:</span>
                            <span className="fw-bold text-primary">{currentSign}</span>
                          </div>
                          <div className="mb-2 d-flex justify-content-between">
                            <span>Muestras capturadas:</span>
                            <span className="fw-bold text-success">{captureCount}</span>
                          </div>
                          <div className="d-flex justify-content-between">
                            <span>Detección de mano:</span>
                            <span className={isHandDetected ? "text-success fw-bold" : "text-danger fw-bold"}>
                              {isHandDetected ? "✅ Detectada" : "❌ No detectada"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="card border-0 shadow-sm rounded-3">
                        <div className="card-header bg-light">
                          <h5 className="card-title mb-0">📚 Catálogo de Signos</h5>
                        </div>
                        <div className="card-body">
                          <div className="d-flex flex-wrap gap-2">
                            {categories[selectedCategory].map((sign) => (
                              <button
                                key={sign}
                                onClick={() => setCurrentSign(sign)}
                                className={`btn btn-sm px-3 fw-bold ${
                                  currentSign === sign ? "btn-primary" : "btn-outline-secondary"
                                }`}
                              >
                                {sign}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="d-flex flex-wrap justify-content-center gap-3 mt-2">
                        <button
                          onClick={() => setIsCameraOn(!isCameraOn)}
                          className={`btn ${isCameraOn ? "btn-danger" : "btn-success"}`}
                        >
                          {isCameraOn ? "🔴 Apagar Cámara" : "🟢 Encender Cámara"}
                        </button>

                        <button
                          onClick={captureSample}
                          disabled={!isHandDetected || !isCameraOn}
                          className="btn btn-primary"
                        >
                          📸 Capturar
                        </button>

                        <button
                          onClick={() => setCurrentStep("review")}
                          className="btn btn-secondary"
                        >
                          📑 Revisar
                        </button>

                        <button
                          onClick={resetCollection}
                          className="btn btn-outline-danger"
                        >
                          🔄 Reiniciar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

{/* Extra Capture Info */}
{currentStep === 'capture' && (
  <div className="container my-4">
    {/* Barra de progreso */}
    <div className="card shadow-sm border-0 rounded-3 mb-4">
      <div className="card-body">
        <h6 className="fw-bold mb-2">📊 Progreso de Captura</h6>
        <div className="progress">
          <div
            className="progress-bar progress-bar-striped bg-success"
            role="progressbar"
            style={{
              width: `${(captureCount / categories[selectedCategory].length) * 100}%`
            }}
            aria-valuenow={captureCount}
            aria-valuemin="0"
            aria-valuemax={categories[selectedCategory].length}
          >
            {captureCount}/{categories[selectedCategory].length} muestras
          </div>
        </div>
      </div>
    </div>

        {/* Consejos */}
        <div className="card shadow-sm border-0 rounded-3 text-center">
          <div className="card-body">
            <h6 className="fw-bold mb-2">📌 Consejos de Captura</h6>
            <p className="text-muted small mb-1">✔ Asegúrate de buena iluminación</p>
            <p className="text-muted small mb-1">✔ Mantén la mano dentro del recuadro</p>
            <p className="text-muted small">✔ Haz el gesto de forma clara y estable</p>
          </div>
        </div>
      </div>
    )}

      {/* Review Step */}
      {currentStep === "review" && (
        <section className="container my-5">
          <div className="card shadow-lg border-0 rounded-3">
            <div className="card-header bg-light d-flex justify-content-between align-items-center">
              <h2 className="card-title fw-bold mb-0">📋 Revisión de Muestras</h2>
              <span className="badge bg-primary px-3 py-2">
                {selectedCategory.toUpperCase()}
              </span>
            </div>

            <div className="card-body">
              {/* Estadísticas globales */}
              <div className="row text-center mb-4">
                <div className="col-md-4">
                  <h4 className="fw-bold text-success">
                    {stats?.total_samples || 0}
                  </h4>
                  <p className="text-muted">Total de muestras</p>
                </div>
                <div className="col-md-4">
                  <h4 className="fw-bold text-primary">
                    {categories[selectedCategory]?.length || 0}
                  </h4>
                  <p className="text-muted">Señas diferentes</p>
                </div>
                <div className="col-md-4">
                  <h4 className="fw-bold text-warning">
                    {(
                      (stats?.total_samples || 0) /
                      (categories[selectedCategory]?.length || 1)
                    ).toFixed(1)}
                  </h4>
                  <p className="text-muted">Promedio por seña</p>
                </div>
              </div>

              {/* Revisión de cada seña */}
              <div className="row g-4 justify-content-center">
                {categories[selectedCategory].map((sign) => {
                  const signSamples = stats?.signs?.[sign]?.samples || 0;

                  // 🔹 Nueva meta: 25 muestras
                  const meta = 25;
                  const progress = Math.min((signSamples / meta) * 100, 100);

                  return (
                    <div className="col-sm-6 col-md-4 col-lg-3" key={sign}>
                      <div className="card shadow-sm border-0 text-center p-3 h-100">
                        <h5 className="fw-bold">{sign}</h5>
                        <p className="text-muted small mb-2">
                          {signSamples} muestras
                        </p>
                        <div className="progress mb-2" style={{ height: "8px" }}>
                          <div
                            className={`progress-bar ${
                              progress >= 70
                                ? "bg-success"
                                : progress >= 30
                                ? "bg-warning"
                                : "bg-danger"
                            }`}
                            role="progressbar"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <small className="text-muted">
                          {progress.toFixed(0)}% de {meta}
                        </small>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Botones */}
              <div className="text-center mt-5">
                <button onClick={nextStep} className="btn btn-success px-5">
                  🚀 Continuar al Entrenamiento
                </button>
                <button
                  onClick={() => setCurrentStep("capture")}
                  className="btn btn-outline-secondary ms-3"
                >
                  🔙 Volver a Captura
                </button>
              </div>
            </div>
          </div>
        </section>
      )}


      {/* Complete Step */}
      {currentStep === 'complete' && (
        <div className="card">
          <div className="card-body text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-4">¡Recolección Completada!</h2>
            <p className="text-lg mb-6">
              Has capturado {samples.length} muestras para la categoría {selectedCategory}.
              Ahora puedes proceder al entrenamiento del modelo.
            </p>
            <div className="space-x-4">
              <button className="btn btn-primary">Ir al Entrenamiento</button>
              <button onClick={resetCollection} className="btn btn-secondary">
                Capturar Más Datos
              </button>
            </div>
          </div>
        </div>
      )}
            {/* 🔹 Footer */}
      <Footer />
    </div>
  )
}

export default DataCollection
