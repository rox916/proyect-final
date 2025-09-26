import React, { useState } from 'react'
import MediaPipeCamera from '../components/MediaPipeCamera'
import AIAgent from '../components/AIAgent'
import { useStats } from '../hooks/useStats'

const DataCollection = () => {
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
          
          // Cambiar a la siguiente seña
          const currentIndex = categories[selectedCategory].indexOf(currentSign)
          if (currentIndex < categories[selectedCategory].length - 1) {
            setCurrentSign(categories[selectedCategory][currentIndex + 1])
            setAiMessage(`Ahora realiza la seña para la letra ${categories[selectedCategory][currentIndex + 1]}`)
          } else {
            setAiMessage('¡Has completado todas las señas de esta categoría!')
          }
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
      {/* Header */}
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Recolección de Datos</h1>
          <p className="card-subtitle">Captura muestras de señas para entrenar tu modelo</p>
        </div>
      </div>

      {/* AI Agent */}
      <AIAgent
        type={currentStep === 'setup' ? 'welcome' : 'guidance'}
        userId={1}
        categoryName={selectedCategory}
        onMessage={setAiMessage}
      />

      {/* Setup Step */}
      {currentStep === 'setup' && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Configuración</h2>
            <p className="card-subtitle">Selecciona la categoría de señas que quieres entrenar</p>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(categories).map(([key, signs]) => (
                <div key={key} className="border rounded p-4">
                  <h3 className="font-semibold mb-2 capitalize">{key}</h3>
                  <p className="text-sm text-secondary mb-3">
                    {key === 'abecedario' ? 'A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z' :
                     key === 'algebraicas' ? 'x, y, z, (, ), ^' :
                     signs.join(', ')}
                  </p>
                  {key === 'abecedario' && (
                    <div className="text-xs text-blue-600 mb-2">
                      📚 Abecedario completo A-Z
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mb-2">
                    {signs.length} señas disponibles
                  </div>
                  <button
                    onClick={() => {
                      setSelectedCategory(key)
                      setCurrentSign(signs[0])
                    }}
                    className={`btn btn-sm w-full ${selectedCategory === key ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    {selectedCategory === key ? 'Seleccionado' : 'Seleccionar'}
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <button onClick={nextStep} className="btn btn-primary btn-lg">
                Iniciar Captura
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Capture Step */}
      {currentStep === 'capture' && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Captura de Datos</h2>
            <p className="card-subtitle">
              Capturando: {currentSign} | Muestras: {captureCount}
            </p>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* MediaPipe Camera Component */}
              <MediaPipeCamera
                onLandmarks={handleLandmarks}
                onHandDetected={handleHandDetected}
              />

              {/* Controls */}
              <div className="space-y-4">
                <div className="card">
                  <div className="card-body">
                    <h3 className="font-semibold mb-2">Estado de Captura</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Seña actual:</span>
                        <span className="font-semibold">{currentSign}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Muestras capturadas:</span>
                        <span className="font-semibold">{captureCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Detección de mano:</span>
                        <span className={isHandDetected ? 'text-success' : 'text-error'}>
                          {isHandDetected ? 'Detectada' : 'No detectada'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={captureSample}
                    disabled={!isHandDetected}
                    className="btn btn-success w-full"
                  >
                    Capturar Muestra
                  </button>
                  
                  <button
                    onClick={() => window.location.reload()}
                    className="btn btn-primary w-full"
                  >
                    🔄 Reiniciar Cámara
                  </button>
                  
                  <button
                    onClick={() => setCurrentStep('review')}
                    className="btn btn-secondary w-full"
                  >
                    Revisar Muestras
                  </button>
                  
                  <button
                    onClick={resetCollection}
                    className="btn btn-error w-full"
                  >
                    Reiniciar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Step */}
      {currentStep === 'review' && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Revisión de Muestras</h2>
            <p className="card-subtitle">Verifica las muestras capturadas</p>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                {categories[selectedCategory].map((sign) => {
                  // Obtener muestras desde las estadísticas del backend
                  const signSamples = stats?.signs?.[sign]?.samples || 0
                  return (
                    <div key={sign} className="border rounded p-3 text-center">
                      <div className="text-lg font-bold">{sign}</div>
                      <div className="text-sm text-secondary">
                        {signSamples} muestras
                      </div>
                    </div>
                  )
                })}
              </div>
              
              <div className="text-center">
                <p className="mb-4">
                  Total de muestras capturadas: <strong>{stats?.total_samples || 0}</strong>
                </p>
                <button onClick={nextStep} className="btn btn-primary">
                  Continuar al Entrenamiento
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
              <button className="btn btn-primary">
                Ir al Entrenamiento
              </button>
              <button onClick={resetCollection} className="btn btn-secondary">
                Capturar Más Datos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DataCollection