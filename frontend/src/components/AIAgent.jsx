import React, { useState, useEffect } from 'react'

const AIAgent = ({ type, userId, categoryName, accuracy, onMessage, currentAction, predictionResult, stats }) => {
  const [message, setMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [agentAvatar, setAgentAvatar] = useState('🤖')
  const [messageHistory, setMessageHistory] = useState([])
  const [isSpeaking, setIsSpeaking] = useState(false)

  // Generar mensajes inteligentes basados en contexto
  const generateIntelligentMessage = () => {
    const now = new Date()
    const timeOfDay = now.getHours()
    const greeting = timeOfDay < 12 ? 'Buenos días' : timeOfDay < 18 ? 'Buenas tardes' : 'Buenas noches'
    
    if (type === 'welcome') {
      const welcomeMessages = [
        `${greeting}! Soy tu asistente de reconocimiento de señas. ¿En qué puedo ayudarte hoy?`,
        `¡Hola! Estoy aquí para guiarte en el reconocimiento de señas. ¿Qué te gustaría hacer?`,
        `¡Perfecto! Sistema listo. ¿Quieres recolectar datos, entrenar un modelo o hacer predicciones?`
      ]
      return welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)]
    } 
    
    else if (type === 'guidance') {
      const guidanceTips = {
        vocales: [
          'Para la vocal A: Extiende todos los dedos y separa el pulgar. ¡Mantén la mano estable!',
          'Para la vocal E: Haz un puño suave con el pulgar sobre los otros dedos. ¡Perfecto!',
          'Para la vocal I: Extiende solo el índice hacia arriba. ¡Muy bien!',
          'Para la vocal O: Forma un círculo con el pulgar e índice. ¡Excelente!',
          'Para la vocal U: Extiende el índice y medio juntos. ¡Perfecto!'
        ],
        numeros: [
          'Para el número 1: Extiende solo el índice. ¡Mantén la mano firme!',
          'Para el número 2: Extiende índice y medio. ¡Muy bien!',
          'Para el número 3: Extiende índice, medio y anular. ¡Perfecto!',
          'Para el número 4: Extiende todos los dedos excepto el pulgar. ¡Excelente!',
          'Para el número 5: Extiende todos los dedos. ¡Muy bien!'
        ],
        operaciones: [
          'Para suma (+): Cruza los dedos índice y medio. ¡Mantén la posición!',
          'Para resta (-): Extiende solo el índice hacia abajo. ¡Perfecto!',
          'Para multiplicación (*): Cruza los dedos índice y medio. ¡Excelente!',
          'Para división (/): Haz un movimiento de corte con la mano. ¡Muy bien!',
          'Para igual (=): Extiende índice y medio paralelos. ¡Perfecto!'
        ]
      }
      
      const tips = guidanceTips[categoryName] || ['Mantén tu mano visible y haz la seña claramente.']
      return tips[Math.floor(Math.random() * tips.length)]
    }
    
    else if (type === 'feedback') {
      if (accuracy > 0.95) {
        const successMessages = [
          `¡Excelente! Modelo entrenado con ${(accuracy * 100).toFixed(1)}% de precisión. ¡Está listo para usar!`,
          `¡Perfecto! ${(accuracy * 100).toFixed(1)}% de precisión. Tu modelo está funcionando muy bien.`,
          `¡Increíble! ${(accuracy * 100).toFixed(1)}% de precisión. ¡Ahora puedes hacer predicciones!`
        ]
        return successMessages[Math.floor(Math.random() * successMessages.length)]
      } else if (accuracy > 0.80) {
        return `Buen progreso: ${(accuracy * 100).toFixed(1)}% de precisión. Con más datos mejorará aún más.`
      } else {
        return `Necesitamos más datos: ${(accuracy * 100).toFixed(1)}% de precisión. ¡Recolecta más muestras!`
      }
    }
    
    else if (type === 'prediction') {
      if (predictionResult) {
        if (predictionResult.prediction === "Sin datos") {
          return 'No hay datos de entrenamiento. Ve a "Recolección de Datos" para empezar.'
        } else if (predictionResult.prediction === "No reconocido") {
          const lowConfidenceMessages = [
            `Seña no reconocida (${(predictionResult.confidence * 100).toFixed(0)}% confianza). Intenta una seña más clara.`,
            `No pude identificar esa seña (${(predictionResult.confidence * 100).toFixed(0)}%). ¿Puedes repetirla más despacio?`,
            `Seña no clara (${(predictionResult.confidence * 100).toFixed(0)}%). Asegúrate de que tu mano esté bien visible.`
          ]
          return lowConfidenceMessages[Math.floor(Math.random() * lowConfidenceMessages.length)]
        } else {
          const confidence = predictionResult.confidence
          if (confidence > 0.9) {
            return `¡Perfecto! Detecté "${predictionResult.prediction}" con ${(confidence * 100).toFixed(0)}% de confianza. ¡Excelente seña!`
          } else if (confidence > 0.7) {
            return `¡Bien! Reconocí "${predictionResult.prediction}" con ${(confidence * 100).toFixed(0)}% de confianza.`
          } else {
            return `Detecté "${predictionResult.prediction}" con ${(confidence * 100).toFixed(0)}% de confianza. Podría ser más claro.`
          }
        }
      } else if (currentAction === 'waiting_hand') {
        return 'Esperando que coloques tu mano frente a la cámara...'
      } else if (currentAction === 'hand_detected') {
        return '¡Mano detectada! Ahora haz una seña clara y mantenla por un momento.'
      } else if (currentAction === 'no_model') {
        return 'Primero selecciona un modelo entrenado para hacer predicciones.'
      } else if (currentAction === 'predicting') {
        return 'Analizando tu seña... ¡Un momento!'
      } else {
        return 'Listo para reconocer tus señas. ¡Coloca tu mano frente a la cámara!'
      }
    }
    
    return '¿En qué puedo ayudarte?'
  }

  useEffect(() => {
    const newMessage = generateIntelligentMessage()
    setMessage(newMessage)
    
    // Agregar al historial
    setMessageHistory(prev => [...prev.slice(-4), { message: newMessage, timestamp: Date.now() }])
  }, [type, categoryName, accuracy, currentAction, predictionResult, stats])

  useEffect(() => {
    if (message && onMessage) {
      onMessage(message)
    }
  }, [message, onMessage])

  const speakMessage = () => {
    if ('speechSynthesis' in window && message && !isSpeaking) {
      setIsSpeaking(true)
      
      // Detener audio anterior
      speechSynthesis.cancel()
      
      const utterance = new SpeechSynthesisUtterance(message)
      
      // Configuración inteligente basada en el tipo de mensaje
      if (type === 'welcome') {
        utterance.rate = 1.0  // Más lento para bienvenida
        utterance.pitch = 1.1  // Tono amigable
      } else if (type === 'guidance') {
        utterance.rate = 0.9  // Lento para instrucciones
        utterance.pitch = 1.0  // Tono instructivo
      } else if (type === 'feedback') {
        utterance.rate = 1.2  // Rápido para feedback
        utterance.pitch = 1.2  // Tono entusiasta
      } else if (type === 'prediction') {
        utterance.rate = 1.1  // Normal para predicciones
        utterance.pitch = 1.0  // Tono neutral
      } else {
        utterance.rate = 1.0
        utterance.pitch = 1.0
      }
      
      utterance.volume = 0.8
      utterance.lang = 'es-ES'
      
      // Configurar voz en español
      const voices = speechSynthesis.getVoices()
      const spanishVoice = voices.find(voice => 
        voice.lang.startsWith('es') && voice.name.includes('Microsoft')
      ) || voices.find(voice => voice.lang.startsWith('es'))
      
      if (spanishVoice) {
        utterance.voice = spanishVoice
      }
      
      // Eventos para controlar el estado
      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)
      
      speechSynthesis.speak(utterance)
    }
  }

  const getMessageIcon = () => {
    switch (type) {
      case 'welcome': return '👋'
      case 'guidance': return '👋'
      case 'feedback': return '📊'
      case 'prediction': return '🔮'
      default: return '🤖'
    }
  }

  const getMessageColor = () => {
    switch (type) {
      case 'welcome': return 'alert-info'
      case 'guidance': return 'alert-info'
      case 'feedback': return accuracy > 0.8 ? 'alert-success' : 'alert-warning'
      case 'prediction': return 'alert-info'
      default: return 'alert-info'
    }
  }

  return (
    <div className="d-flex justify-content-center my-4">
    <div className="card shadow-sm border-0" style={{ maxWidth: "600px", width: "100%" }}>
      {/* Header */}
      <div className="card-header bg-light border-0 d-flex align-items-center gap-2">
        <span className="fs-5">🤖</span>
        <h6 className="fw-bold mb-0">Asistente IA</h6>
        {isTyping && <div className="spinner ms-2"></div>}
        {isSpeaking && <span className="text-success ms-2">🔊</span>}
      </div>

      {/* Cuerpo */}
      <div className="card-body">
        <p className="text-muted small mb-2">{message}</p>

        {messageHistory.length > 1 && (
          <div className="mt-2 text-xs text-gray-500">
            <details>
              <summary className="cursor-pointer">📜 Ver historial</summary>
              <div className="mt-2 space-y-1">
                {messageHistory.slice(0, -1).reverse().map((item, index) => (
                  <div key={index} className="text-xs opacity-75">
                    {item.message}
                  </div>
                ))}
              </div>
            </details>
          </div>
        )}
      </div>

      {/* Footer con botones */}
      {message && (
        <div className="card-footer bg-light border-0 d-flex gap-2 justify-content-end">
          <button
            onClick={speakMessage}
            disabled={isSpeaking}
            className={`btn btn-sm ${isSpeaking ? "btn-disabled" : "btn-outline-primary"}`}
            title="Reproducir audio"
          >
            {isSpeaking ? "🔊 Hablando..." : "🔊 Reproducir"}
          </button>
          <button
            onClick={() => setMessage("")}
            className="btn btn-sm btn-outline-secondary"
            title="Cerrar mensaje"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  </div>
  )
}

export default AIAgent
