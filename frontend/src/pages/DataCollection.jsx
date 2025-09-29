import React, { useState, useEffect } from 'react'
import MediaPipeCamera from '../components/MediaPipeCamera'
import AIAgent from '../components/AIAgent'
import { useStats } from '../hooks/useStats'
import HeroNavbar from "../components/HeroNavbar";
import Footer from "../components/Footer";

const DataCollection = () => {
  const [isCameraOn, setIsCameraOn] = useState(true)
  const [currentStep, setCurrentStep] = useState('setup')
  const [selectedCategory, setSelectedCategory] = useState('vocales')
  const [currentSign, setCurrentSign] = useState('A')
  const [samples, setSamples] = useState([])
  const [isCapturing, setIsCapturing] = useState(false)
  const [captureCount, setCaptureCount] = useState(0)
  const [aiMessage, setAiMessage] = useState('')
  const [isHandDetected, setIsHandDetected] = useState(false)
  const [landmarks, setLandmarks] = useState(null)
  const [landmarksLeft, setLandmarksLeft] = useState(null)
  const [landmarksRight, setLandmarksRight] = useState(null)
  const [bothHandsDetected, setBothHandsDetected] = useState(false)
  const [autoCapture, setAutoCapture] = useState(false)
  const [lastCaptureTime, setLastCaptureTime] = useState(0)
  const [captureInterval, setCaptureInterval] = useState(null)
  const [composedNumber, setComposedNumber] = useState('')
  const [isComposing, setIsComposing] = useState(false)
  
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
    console.log('👋 Mano detectada:', detected)
    setIsHandDetected(detected)
  }

  const handleTwoHands = (leftLandmarks, rightLandmarks) => {
    console.log('🤟 Dos manos detectadas:', {
      leftLandmarks: leftLandmarks?.length,
      rightLandmarks: rightLandmarks?.length
    })
    setLandmarksLeft(leftLandmarks)
    setLandmarksRight(rightLandmarks)
    setBothHandsDetected(true)
    // También actualizar el estado de detección de mano individual
    setLandmarks(leftLandmarks) // Usar mano izquierda como principal
    setIsHandDetected(true)
  }

  // Determinar si la categoría actual requiere dos manos
  const requiresTwoHands = selectedCategory === 'numeros' || selectedCategory === 'operaciones'
  
  // Verificar si se alcanzó el límite de muestras
  const isLimitReached = () => {
    return stats?.letter_limits?.[currentSign]?.max_reached || 
           stats?.vocal_limits?.[currentSign]?.max_reached || 
           stats?.numero_limits?.[currentSign]?.max_reached || 
           stats?.operacion_limits?.[currentSign]?.max_reached
  }

  // Activar/desactivar captura automática
  const toggleAutoCapture = () => {
    const newAutoCapture = !autoCapture
    console.log('🔄 Cambiando captura automática:', {
      from: autoCapture,
      to: newAutoCapture,
      requiresTwoHands,
      bothHandsDetected,
      isHandDetected
    })
    
    setAutoCapture(newAutoCapture)
    if (newAutoCapture) {
      const handMessage = requiresTwoHands 
        ? 'Mantén ambas manos en la cámara' 
        : 'Mantén la mano en la cámara'
      setAiMessage(`🔄 Captura automática activada - ${handMessage}`)
    } else {
      setAiMessage('⏸️ Captura automática desactivada')
    }
  }

  // Iniciar composición de número
  const startComposing = () => {
    if (selectedCategory === 'numeros') {
      setIsComposing(true)
      setComposedNumber('')
      setAiMessage('🔢 Modo composición activado - Presiona los dígitos en orden')
    }
  }

  // Agregar dígito al número compuesto
  const addDigit = (digit) => {
    setComposedNumber(prev => prev + digit)
    setAiMessage(`🔢 Número compuesto: ${composedNumber + digit}`)
  }

  // Finalizar composición
  const finishComposing = () => {
    if (composedNumber) {
      setCurrentSign(composedNumber)
      setIsComposing(false)
      setAiMessage(`✅ Número ${composedNumber} seleccionado`)
    }
  }

  // Cancelar composición
  const cancelComposing = () => {
    setIsComposing(false)
    setComposedNumber('')
    setAiMessage('❌ Composición cancelada')
  }

  // Detener captura automática cuando se alcanza el límite
  useEffect(() => {
    if (isLimitReached() && autoCapture) {
      setAutoCapture(false)
      setAiMessage('🚫 Límite alcanzado - Captura automática desactivada')
    }
  }, [stats, currentSign, autoCapture])

  // Limpiar estado cuando se cambia de categoría o signo
  useEffect(() => {
    setAutoCapture(false)
    setLandmarksLeft(null)
    setLandmarksRight(null)
    setBothHandsDetected(false)
    setIsComposing(false)
    setComposedNumber('')
  }, [selectedCategory, currentSign])

  // Captura automática
  useEffect(() => {
    if (!autoCapture || isLimitReached()) {
      return
    }
    console.log('🔄 Iniciando captura automática...', {
      autoCapture,
      requiresTwoHands,
      bothHandsDetected,
      isHandDetected,
      landmarksLeft: landmarksLeft?.length,
      landmarksRight: landmarksRight?.length,
      landmarks: landmarks?.length
    })

    const interval = setInterval(() => {
      // Verificar condiciones de manera más eficiente
      const hasValidLandmarks = requiresTwoHands 
        ? (bothHandsDetected && landmarksLeft && landmarksRight && 
           landmarksLeft.length === 21 && landmarksRight.length === 21)
        : (isHandDetected && landmarks && landmarks.length === 21)
      
      if (hasValidLandmarks && !isLimitReached()) {
        console.log('✅ Capturando muestra automáticamente...')
        captureSample()
      }
    }, 1000) // Capturar cada 1 segundo (más rápido)

    return () => {
      console.log('🛑 Deteniendo captura automática...')
      clearInterval(interval)
    }
  }, [autoCapture, currentSign]) // Solo dependencias esenciales

  const captureSample = async () => {
    // Evitar capturas simultáneas
    if (isCapturing) return
    
    // Verificar si hemos alcanzado el límite
    if (isLimitReached()) {
      setAiMessage('🚫 Límite de muestras alcanzado para este elemento')
      return
    }

    // Verificar si tenemos los landmarks necesarios
    const hasValidLandmarks = requiresTwoHands 
      ? (landmarksLeft && landmarksRight && landmarksLeft.length === 21 && landmarksRight.length === 21)
      : (landmarks && landmarks.length === 21)

    if (hasValidLandmarks) {
      setIsCapturing(true)
      const newSample = {
        landmarks: requiresTwoHands ? landmarksLeft : landmarks, // Usar landmarks de mano izquierda como principal
        landmarks_left: requiresTwoHands ? landmarksLeft : null,
        landmarks_right: requiresTwoHands ? landmarksRight : null,
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
          // Actualizar contador inmediatamente para feedback visual más rápido
          const newCount = captureCount + 1
          setCaptureCount(newCount)
          
          // Mensaje optimizado para captura automática
          if (autoCapture) {
            setAiMessage(`🔄 ${newCount}/25 muestras capturadas`)
          } else {
            setAiMessage(`✅ Muestra ${newCount} capturada para ${currentSign}`)
          }
          
          // Refrescar estadísticas de forma asíncrona (no bloquea la UI)
          setTimeout(() => refetchStats(), 100)
        } else {
          const errorData = await response.json()
          setAiMessage(`❌ ${errorData.detail || 'Error al guardar'}`)
        }
      } catch (error) {
        console.error('Error enviando muestra:', error)
        setAiMessage('Error de conexión. Verifica que el backend esté funcionando.')
      } finally {
        setIsCapturing(false)
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
      {currentStep !== "capture" && (
        <section className="container my-5">
          <h2 className="fw-bold text-center mb-4">Recolección de Datos</h2>
          <p className="text-center text-muted mb-5">
            Captura muestras de señas para entrenar tu modelo
          </p>
          <AIAgent
            type={currentStep === "setup" ? "welcome" : "guidance"}
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
                      <h5 className="fw-bold mb-0">📸 Captura de Datos</h5>
                      <small className="text-muted">
                        {selectedCategory.toUpperCase()} - {currentSign}
                      </small>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-primary">
                      {captureCount}/25 muestras
                    </span>
                  </div>
                </div>

                <div className="card-body">
                  <div className="row g-4">
                    <div className="col-md-7">
                      <div className="card shadow-sm">
                        <div className="card-body">
                          <MediaPipeCamera
                            onLandmarks={handleLandmarks}
                            onHandDetected={handleHandDetected}
                            onTwoHands={handleTwoHands}
                            requiresTwoHands={requiresTwoHands}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="col-md-5">
                      <div className="card shadow-sm">
                        <div className="card-body text-center">
                          <h5 className="fw-bold mb-3">Estado del Sistema</h5>
                          <p>
                            Estado:{" "}
                            {isCameraOn ? (
                              <span className="text-success fw-bold">Activo ✅</span>
                            ) : (
                              <span className="text-danger fw-bold">Inactivo ❌</span>
                            )}
                          </p>
                          
                          {/* Detección de manos */}
                          <div className="d-flex justify-content-between">
                            <span>Detección:</span>
                            {requiresTwoHands ? (
                              <div className="d-flex gap-2">
                                <span className={`badge ${landmarksLeft ? 'bg-success' : 'bg-secondary'}`}>
                                  {landmarksLeft ? '✅ Izq' : '⏳ Izq'}
                                </span>
                                <span className={`badge ${landmarksRight ? 'bg-success' : 'bg-secondary'}`}>
                                  {landmarksRight ? '✅ Der' : '⏳ Der'}
                                </span>
                              </div>
                            ) : (
                              <span className={isHandDetected ? "text-success fw-bold" : "text-danger fw-bold"}>
                                {isHandDetected ? "✅ Detectada" : "❌ No detectada"}
                              </span>
                            )}
                          </div>
                          
                          {/* Indicador de captura automática */}
                          <div className="d-flex justify-content-between">
                            <span>Captura automática:</span>
                            <div className="d-flex align-items-center gap-2">
                              <span className={`badge ${autoCapture ? 'bg-success' : 'bg-secondary'}`}>
                                {autoCapture ? '🔄 Activa' : '⏸️ Inactiva'}
                              </span>
                              {autoCapture && (
                                <span className="badge bg-info">
                                  {requiresTwoHands ? '2 manos' : '1 mano'}
                                </span>
                              )}
                              {isCapturing && (
                                <span className="badge bg-warning pulse">
                                  📸 Capturando...
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Indicador de composición de números */}
                          {selectedCategory === 'numeros' && isComposing && (
                            <div className="d-flex justify-content-between">
                              <span>Número compuesto:</span>
                              <span className="badge bg-info">
                                {composedNumber || 'Vacío'}
                              </span>
                            </div>
                          )}
                          
                          {/* Catálogo de señas */}
                          <div className="mt-4">
                            <h6 className="fw-bold mb-3">📚 Catálogo de Señas</h6>
                            <div className="d-flex flex-wrap gap-2">
                              {categories[selectedCategory].map((sign) => {
                                const count = stats?.letter_limits?.[sign]?.count || 
                                             stats?.vocal_limits?.[sign]?.count || 
                                             stats?.numero_limits?.[sign]?.count || 
                                             stats?.operacion_limits?.[sign]?.count || 0
                                const isMaxReached = stats?.letter_limits?.[sign]?.max_reached || 
                                                    stats?.vocal_limits?.[sign]?.max_reached || 
                                                    stats?.numero_limits?.[sign]?.max_reached || 
                                                    stats?.operacion_limits?.[sign]?.max_reached || false
                                
                                const handleClick = () => {
                                  if (selectedCategory === 'numeros' && isComposing) {
                                    addDigit(sign)
                                  } else {
                                    setCurrentSign(sign)
                                  }
                                }
                                
                                return (
                                  <button
                                    key={sign}
                                    onClick={handleClick}
                                    className={`btn btn-sm px-3 fw-bold ${
                                      currentSign === sign 
                                        ? "btn-primary" 
                                        : isMaxReached 
                                            ? "btn-outline-danger" 
                                            : isComposing && selectedCategory === 'numeros'
                                                ? "btn-outline-info"
                                                : "btn-outline-secondary"
                                    }`}
                                    title={isComposing && selectedCategory === 'numeros' 
                                      ? `Agregar dígito ${sign}` 
                                      : `${count}/25 muestras`}
                                  >
                                    {sign} {isMaxReached && "🔒"}
                                  </button>
                                )
                              })}
                            </div>
                            
                            {/* Botones de composición para números */}
                            {selectedCategory === 'numeros' && (
                              <div className="mt-3 d-flex gap-2 justify-content-center">
                                {!isComposing ? (
                                  <button 
                                    onClick={startComposing}
                                    className="btn btn-outline-info btn-sm"
                                  >
                                    🔢 Componer Número
                                  </button>
                                ) : (
                                  <>
                                    <button 
                                      onClick={finishComposing}
                                      disabled={!composedNumber}
                                      className="btn btn-success btn-sm"
                                    >
                                      ✅ Finalizar
                                    </button>
                                    <button 
                                      onClick={cancelComposing}
                                      className="btn btn-outline-danger btn-sm"
                                    >
                                      ❌ Cancelar
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="d-grid gap-2 mt-3">
                            {/* Botón de captura automática */}
                            {!isComposing && (
                              <button
                                onClick={toggleAutoCapture}
                                disabled={!isCameraOn || 
                                  (requiresTwoHands ? !bothHandsDetected : !isHandDetected) ||
                                  isLimitReached() || isCapturing}
                                className={`btn ${autoCapture ? 'btn-success' : 'btn-outline-success'} ${isCapturing ? 'pulse' : ''}`}
                              >
                                {isCapturing ? '📸 Capturando...' : (autoCapture ? '⏸️ Pausar Auto' : '🔄 Auto Captura')}
                              </button>
                            )}

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
          </div>

          {/* Extra Capture Info */}
          <div className="container my-4">
            {/* Barra de progreso por letra actual */}
            <div className="card shadow-sm border-0 rounded-3 mb-4">
              <div className="card-body">
                <h6 className="fw-bold mb-2">📊 Progreso de {currentSign}</h6>
                <div className="progress mb-2">
                  <div
                    className={`progress-bar progress-bar-striped ${
                      stats?.letter_limits?.[currentSign]?.max_reached || 
                      stats?.vocal_limits?.[currentSign]?.max_reached || 
                      stats?.numero_limits?.[currentSign]?.max_reached || 
                      stats?.operacion_limits?.[currentSign]?.max_reached 
                      ? 'bg-danger' : 'bg-info'
                    }`}
                    role="progressbar"
                    style={{
                      width: `${((stats?.letter_limits?.[currentSign]?.count || 
                                 stats?.vocal_limits?.[currentSign]?.count || 
                                 stats?.numero_limits?.[currentSign]?.count || 
                                 stats?.operacion_limits?.[currentSign]?.count || 0) / 25) * 100}%`
                    }}
                    aria-valuenow={stats?.letter_limits?.[currentSign]?.count || 
                                   stats?.vocal_limits?.[currentSign]?.count || 
                                   stats?.numero_limits?.[currentSign]?.count || 
                                   stats?.operacion_limits?.[currentSign]?.count || 0}
                    aria-valuemin="0"
                    aria-valuemax="25"
                  ></div>
                </div>
                <div className="d-flex justify-content-between">
                  <small className="text-muted">
                    Muestras de {currentSign}: {stats?.letter_limits?.[currentSign]?.count || 
                                               stats?.vocal_limits?.[currentSign]?.count || 
                                               stats?.numero_limits?.[currentSign]?.count || 
                                               stats?.operacion_limits?.[currentSign]?.count || 0}/25
                  </small>
                  <small className="text-muted">
                    {stats?.letter_limits?.[currentSign]?.max_reached || 
                     stats?.vocal_limits?.[currentSign]?.max_reached || 
                     stats?.numero_limits?.[currentSign]?.max_reached || 
                     stats?.operacion_limits?.[currentSign]?.max_reached 
                     ? '🔒 Límite alcanzado' : '🔄 En progreso'}
                  </small>
                </div>
              </div>
            </div>


            {/* Mensaje del AI */}
            {aiMessage && (
              <div className="alert alert-info">
                <strong>🤖 Asistente:</strong> {aiMessage}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Review Step */}
      {currentStep === 'review' && (
        <div className="container my-5">
          <div className="card">
            <div className="card-body text-center">
              <h2 className="fw-bold mb-4">📊 Resumen de Captura</h2>
              <p className="text-muted mb-4">
                Has capturado {samples.length} muestras para la categoría {selectedCategory}
              </p>
              <div className="d-flex justify-content-center gap-3">
                <button className="btn btn-primary" onClick={nextStep}>
                  Continuar
                </button>
                <button className="btn btn-secondary" onClick={resetCollection}>
                  Reiniciar
                </button>
              </div>
            </div>
          </div>
        </div>
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