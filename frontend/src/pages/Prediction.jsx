import React, { useState, useEffect } from 'react'
import MediaPipeCamera from '../components/MediaPipeCamera'
import AIAgent from '../components/AIAgent'

const Prediction = () => {
  const [isPredicting, setIsPredicting] = useState(false)
  const [currentPrediction, setCurrentPrediction] = useState(null)
  const [predictionHistory, setPredictionHistory] = useState([])
  const [selectedModel, setSelectedModel] = useState('')
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [aiFeedback, setAiFeedback] = useState('')
  const [isHandDetected, setIsHandDetected] = useState(false)
  const [landmarks, setLandmarks] = useState(null)
  const [currentAction, setCurrentAction] = useState('idle')
  const [lastPredictionTime, setLastPredictionTime] = useState(0)
  const [handStableTime, setHandStableTime] = useState(0)

  const [availableModels, setAvailableModels] = useState([])
  const [modelsLoading, setModelsLoading] = useState(true)

  // Cargar modelos dinámicamente desde el backend
  useEffect(() => {
    loadModels()
  }, [])

  const loadModels = async () => {
    setModelsLoading(true)
    try {
      const categories = ['vocales', 'numeros', 'operaciones', 'abecedario']
      const models = []
      
      for (const category of categories) {
        try {
          // Verificar si hay datos
          const statsResponse = await fetch(`http://localhost:8000/api/v1/${category}/stats/1`)
          if (statsResponse.ok) {
            const stats = await statsResponse.json()
            const hasData = stats.total_samples > 0
            
            // Verificar si hay modelo entrenado
            let isTrained = false
            let accuracy = 0.0
            
            if (hasData) {
              try {
                const trainResponse = await fetch(`http://localhost:8000/api/v1/${category}/train/1`, {
                  method: 'POST'
                })
                if (trainResponse.ok) {
                  const trainResult = await trainResponse.json()
                  isTrained = trainResult.success
                  accuracy = trainResult.accuracy || 0.0
                }
              } catch (e) {
                // Si falla el entrenamiento, no está entrenado
                isTrained = false
              }
            }
            
            models.push({
              id: models.length + 1,
              name: `Modelo ${category.charAt(0).toUpperCase() + category.slice(1)}`,
              category: category,
              accuracy: accuracy,
              status: isTrained ? 'trained' : (hasData ? 'ready_to_train' : 'no_data'),
              samples: stats.total_samples || 0
            })
          }
        } catch (error) {
          console.error(`Error cargando ${category}:`, error)
          models.push({
            id: models.length + 1,
            name: `Modelo ${category.charAt(0).toUpperCase() + category.slice(1)}`,
            category: category,
            accuracy: 0.0,
            status: 'no_data',
            samples: 0
          })
        }
      }
      
      setAvailableModels(models)
    } catch (error) {
      console.error('Error cargando modelos:', error)
    } finally {
      setModelsLoading(false)
    }
  }

  useEffect(() => {
    const now = Date.now()
    
    if (!isPredicting) {
      setCurrentAction('idle')
      return
    }

    if (!selectedModel) {
      setCurrentAction('no_model')
      setCurrentPrediction(null)
      return
    }

    if (!isHandDetected) {
      setCurrentAction('waiting_hand')
      setCurrentPrediction(null)
      setHandStableTime(0)
      return
    }

    if (isHandDetected && landmarks && landmarks.length === 21) {
      // Verificar que la mano esté estable por al menos 500ms antes de predecir
      if (handStableTime === 0) {
        setHandStableTime(now)
        setCurrentAction('hand_detected')
        return
      }

      const stableTime = now - handStableTime
      if (stableTime < 500) {
        setCurrentAction('hand_detected')
        return
      }

      // Evitar predicciones muy frecuentes (máximo cada 1 segundo)
      if (now - lastPredictionTime < 1000) {
        return
      }

      // Hacer predicción real con el backend
      const model = availableModels.find(m => m.id === parseInt(selectedModel))
      if (model && model.status === 'trained') {
        setCurrentAction('predicting')
        setLastPredictionTime(now)
        predictWithBackend(landmarks, model.category)
      }
    }
  }, [landmarks, isHandDetected, isPredicting, selectedModel, handStableTime, lastPredictionTime])

  const predictWithBackend = async (landmarks, category) => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/${category}/predict/1`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(landmarks)
      })
      
      if (response.ok) {
        const result = await response.json()
        
        const predictionResult = {
          prediction: result.prediction,
          confidence: result.confidence,
          timestamp: result.timestamp,
          model: availableModels.find(m => m.id === parseInt(selectedModel))?.name || 'Modelo'
        }
        
        setCurrentPrediction(predictionResult)
        setPredictionHistory(prev => [predictionResult, ...prev.slice(0, 9)])
        
        // Audio feedback solo para predicciones exitosas
        if (audioEnabled && result.prediction !== "Sin datos" && result.prediction !== "No reconocido") {
          speakPrediction(result.prediction, result.confidence)
        }
        
        // Resetear a estado de espera después de predicción
        setTimeout(() => {
          setCurrentAction('hand_detected')
        }, 500)
        
      } else {
        setCurrentPrediction({ prediction: "Error", confidence: 0, timestamp: new Date().toISOString() })
      }
    } catch (error) {
      console.error('Error en predicción:', error)
      setCurrentPrediction({ prediction: "Error de conexión", confidence: 0, timestamp: new Date().toISOString() })
    }
  }

  const speakPrediction = (prediction, confidence) => {
    if ('speechSynthesis' in window) {
      // Detener cualquier audio anterior inmediatamente
      speechSynthesis.cancel()
      
      const utterance = new SpeechSynthesisUtterance(prediction)
      utterance.rate = 1.8  // Más rápido y natural
      utterance.pitch = 1.0
      utterance.volume = 0.9
      utterance.lang = 'es-ES'
      
      // Configurar voz más natural (priorizar Google o Microsoft)
      const voices = speechSynthesis.getVoices()
      const spanishVoice = voices.find(voice => 
        voice.lang.startsWith('es') && (voice.name.includes('Google') || voice.name.includes('Microsoft'))
      ) || voices.find(voice => voice.lang.startsWith('es'))
      
      if (spanishVoice) {
        utterance.voice = spanishVoice
      }
      
      speechSynthesis.speak(utterance)
    }
  }

  const handleLandmarks = (newLandmarks) => {
    setLandmarks(newLandmarks)
  }

  const handleHandDetected = (detected) => {
    setIsHandDetected(detected)
  }

  const startPrediction = () => {
    if (!selectedModel) {
      setAiFeedback('Por favor, selecciona un modelo para hacer predicciones.')
      return
    }
    setIsPredicting(true)
    setAiFeedback('Predicción iniciada. Realiza una seña para que sea reconocida.')
  }

  const stopPrediction = () => {
    setIsPredicting(false)
    setCurrentPrediction(null)
    setAiFeedback('Predicción detenida.')
  }

  const clearHistory = () => {
    setPredictionHistory([])
    setAiFeedback('Historial de predicciones limpiado.')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Predicción en Tiempo Real</h1>
          <p className="card-subtitle">Reconoce señas en tiempo real con feedback visual y vocal</p>
        </div>
      </div>

      {/* AI Agent */}
      <AIAgent
        type="prediction"
        userId={1}
        onMessage={setAiFeedback}
        currentAction={currentAction}
        predictionResult={currentPrediction}
      />

      {/* Model Selection */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Selección de Modelo</h2>
          <p className="card-subtitle">Elige el modelo entrenado que quieres usar</p>
          <button 
            onClick={loadModels}
            className="btn btn-sm btn-secondary"
            disabled={modelsLoading}
          >
            🔄 Actualizar
          </button>
        </div>
        <div className="card-body">
                 {modelsLoading ? (
                   <div className="text-center py-8">
                     <div className="spinner"></div>
                     <p className="text-secondary mt-2">Cargando modelos...</p>
                   </div>
                 ) : (
                   <div className="grid grid-cols-3 gap-4">
                     {availableModels.map((model) => (
                       <div key={model.id} className={`border rounded p-4 ${
                         model.status === 'trained' ? 'border-success bg-green-50' : 
                         model.status === 'ready_to_train' ? 'border-warning bg-yellow-50' :
                         'border-gray-300 bg-gray-50'
                       }`}>
                         <h3 className="font-semibold mb-2">{model.name}</h3>
                         <div className="space-y-1 mb-3">
                           <div className="text-sm text-secondary">
                             Precisión: {(model.accuracy * 100).toFixed(1)}%
                           </div>
                           <div className="text-sm text-secondary">
                             Muestras: {model.samples}
                           </div>
                           <div className={`text-xs px-2 py-1 rounded ${
                             model.status === 'trained' ? 'bg-success text-white' : 
                             model.status === 'ready_to_train' ? 'bg-warning text-white' :
                             'bg-gray-500 text-white'
                           }`}>
                             {model.status === 'trained' ? '✅ Entrenado' : 
                              model.status === 'ready_to_train' ? '⚠️ Listo para entrenar' :
                              '❌ Sin datos'}
                           </div>
                         </div>
                         <button
                           onClick={() => setSelectedModel(model.id.toString())}
                           disabled={model.status !== 'trained'}
                           className={`btn btn-sm w-full ${
                             selectedModel === model.id.toString() ? 'btn-primary' : 
                             model.status === 'trained' ? 'btn-secondary' : 'btn-disabled'
                           }`}
                         >
                           {selectedModel === model.id.toString() ? 'Seleccionado' : 
                            model.status === 'trained' ? 'Seleccionar' : 
                            model.status === 'ready_to_train' ? 'Entrenar primero' : 'Sin datos'}
                         </button>
                       </div>
                     ))}
                   </div>
                 )}
        </div>
      </div>

      {/* Prediction Interface */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Interfaz de Predicción</h2>
          <p className="card-subtitle">
            {isPredicting ? 'Predicción activa - DATOS REALES' : 'Inicia la predicción para reconocer señas'}
          </p>
          <div className="alert alert-success mt-2">
            <strong>✅ PREDICCIÓN REAL:</strong> El sistema ahora usa tus datos reales para hacer predicciones. 
            Asegúrate de haber recolectado datos primero.
          </div>
          <div className="alert alert-info mt-2">
            <strong>🤖 ENTRENAMIENTO ML:</strong> Para mejores predicciones, ve a 
            <a href="/ml-training" className="text-blue-600 underline ml-1">ML Training</a> 
            para entrenar modelos de Machine Learning con tus datos.
          </div>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-2 gap-6">
            {/* MediaPipe Camera */}
            {isPredicting && (
              <MediaPipeCamera
                onLandmarks={handleLandmarks}
                onHandDetected={handleHandDetected}
              />
            )}
            
            {/* Current Prediction */}
            {currentPrediction && (
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-black bg-opacity-75 text-white p-3 rounded">
                  <div className="text-lg font-bold">
                    Predicción: {currentPrediction.prediction}
                  </div>
                  <div className="text-sm">
                    Confianza: {(currentPrediction.confidence * 100).toFixed(1)}% (DATOS REALES)
                  </div>
                  <div className="text-xs text-green-300">
                    ✅ Basado en tus datos de entrenamiento
                  </div>
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="space-y-4">
              <div className="card">
                <div className="card-body">
                  <h3 className="font-semibold mb-2">Estado de Predicción</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Estado:</span>
                      <span className={isPredicting ? 'text-success' : 'text-secondary'}>
                        {isPredicting ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Detección de mano:</span>
                      <span className={isHandDetected ? 'text-success' : 'text-error'}>
                        {isHandDetected ? 'Detectada' : 'No detectada'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Audio:</span>
                      <span className={audioEnabled ? 'text-success' : 'text-secondary'}>
                        {audioEnabled ? 'Activado' : 'Desactivado'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {!isPredicting ? (
                  <button
                    onClick={startPrediction}
                    disabled={!selectedModel}
                    className="btn btn-success w-full"
                  >
                    Iniciar Predicción
                  </button>
                ) : (
                  <button
                    onClick={stopPrediction}
                    className="btn btn-error w-full"
                  >
                    Detener Predicción
                  </button>
                )}
                
                <button
                  onClick={() => setAudioEnabled(!audioEnabled)}
                  className={`btn w-full ${audioEnabled ? 'btn-warning' : 'btn-secondary'}`}
                >
                  {audioEnabled ? 'Desactivar Audio' : 'Activar Audio'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Prediction History */}
      {predictionHistory.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Historial de Predicciones</h2>
            <div className="flex gap-2">
              <button onClick={clearHistory} className="btn btn-secondary btn-sm">
                Limpiar
              </button>
            </div>
          </div>
          <div className="card-body">
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {predictionHistory.map((prediction, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <span className="font-semibold">{prediction.prediction}</span>
                    <span className="text-sm text-secondary ml-2">
                      ({prediction.model})
                    </span>
                  </div>
                  <div className="text-sm text-secondary">
                    {(prediction.confidence * 100).toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* How it works */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">¿Cómo Funciona el Sistema?</h2>
        </div>
        <div className="card-body">
          <div className="space-y-4">
            <div className="alert alert-success">
              <h4 className="font-semibold mb-2">📊 Estado Actual: DATOS REALES</h4>
              <p className="text-sm">
                El sistema ahora usa tus datos reales para hacer predicciones. Esto significa que:
              </p>
              <ul className="text-sm mt-2 space-y-1">
                <li>• <strong>Detecta tu mano</strong> correctamente (MediaPipe funciona)</li>
                <li>• <strong>Predicciones basadas en tus datos</strong> (comparación de landmarks)</li>
                <li>• <strong>Confianza real</strong> basada en similitud con datos de entrenamiento</li>
              </ul>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold">🎯 Cómo Funciona</h4>
                <ul className="text-sm text-secondary space-y-1">
                  <li>• Compara tu mano con datos guardados</li>
                  <li>• Calcula similitud de landmarks</li>
                  <li>• Encuentra la mejor coincidencia</li>
                  <li>• Muestra confianza real</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold">🔊 Audio Actual</h4>
                <ul className="text-sm text-secondary space-y-1">
                  <li>• Habla solo cuando detecta mano</li>
                  <li>• Mensajes cortos y claros</li>
                  <li>• Voz rápida y natural</li>
                  <li>• Basado en datos reales</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Prediction