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
    
    if (type === 'capture') {
      const captureMessages = [
        `Perfecto, estás recolectando datos para ${categoryName}. Mantén la seña clara y visible.`,
        `Excelente! Para ${categoryName}, asegúrate de que tu mano esté bien iluminada.`,
        `¡Muy bien! Continúa con ${categoryName}. La calidad de los datos es importante.`
      ]
      return captureMessages[Math.floor(Math.random() * captureMessages.length)]
    }
    
    if (type === 'training') {
      const accuracyPercent = (accuracy * 100).toFixed(1)
      if (accuracy > 0.8) {
        return `¡Excelente! Tu modelo tiene una precisión del ${accuracyPercent}%. Está listo para usar.`
      } else if (accuracy > 0.6) {
        return `Buen trabajo! Precisión del ${accuracyPercent}%. Considera recolectar más datos para mejorar.`
      } else {
        return `Precisión del ${accuracyPercent}%. Te recomiendo recolectar más muestras variadas.`
      }
    }
    
    if (type === 'prediction') {
      const confidence = (predictionResult?.confidence * 100).toFixed(1)
      return `Detecté "${predictionResult?.prediction}" con ${confidence}% de confianza.`
    }
    
    return '¿En qué más puedo ayudarte?'
  }

  // Efecto para generar mensajes automáticamente
  useEffect(() => {
    if (type && !message) {
      const newMessage = generateIntelligentMessage()
      setMessage(newMessage)
      
      // Simular typing
      setIsTyping(true)
      setTimeout(() => {
        setIsTyping(false)
        if (onMessage) {
          onMessage(newMessage)
        }
      }, 1000)
    }
  }, [type, categoryName, accuracy, predictionResult])

  // Efecto para cambiar avatar según el contexto
  useEffect(() => {
    if (type === 'welcome') setAgentAvatar('👋')
    else if (type === 'capture') setAgentAvatar('📸')
    else if (type === 'training') setAgentAvatar('🧠')
    else if (type === 'prediction') setAgentAvatar('🔮')
    else setAgentAvatar('🤖')
  }, [type])

  // Función para hablar el mensaje
  const speakMessage = () => {
    if ('speechSynthesis' in window && message) {
      setIsSpeaking(true)
      const utterance = new SpeechSynthesisUtterance(message)
      utterance.lang = 'es-ES'
      utterance.rate = 0.9
      utterance.pitch = 1.0
      
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)
      
      speechSynthesis.speak(utterance)
    }
  }

  // Función para parar el habla
  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }

  // Función para agregar mensaje al historial
  const addToHistory = (msg) => {
    setMessageHistory(prev => [{
      id: Date.now(),
      message: msg,
      timestamp: new Date().toLocaleTimeString(),
      type: type || 'info'
    }, ...prev.slice(0, 9)]) // Mantener últimos 10 mensajes
  }

  // Efecto para agregar mensajes al historial
  useEffect(() => {
    if (message && !messageHistory.find(m => m.message === message)) {
      addToHistory(message)
    }
  }, [message])

  return (
    <div className="ai-agent-container">
      <div className="ai-agent-card">
        <div className="ai-agent-header">
          <div className="ai-agent-avatar">
            <span className="avatar-emoji">{agentAvatar}</span>
            {isTyping && <span className="typing-indicator">...</span>}
          </div>
          <div className="ai-agent-info">
            <h6 className="mb-0">Asistente IA</h6>
            <small className="text-muted">Reconocimiento de Señas</small>
          </div>
          <div className="ai-agent-actions">
            {message && (
              <>
                <button 
                  className="btn btn-sm btn-outline-primary me-1"
                  onClick={speakMessage}
                  disabled={isSpeaking}
                  title="Reproducir mensaje"
                >
                  {isSpeaking ? '🔊' : '🔇'}
                </button>
                {isSpeaking && (
                  <button 
                    className="btn btn-sm btn-outline-danger"
                    onClick={stopSpeaking}
                    title="Parar"
                  >
                    ⏹️
                  </button>
                )}
              </>
            )}
          </div>
        </div>
        
        <div className="ai-agent-message">
          {isTyping ? (
            <div className="typing-animation">
              <span></span>
              <span></span>
              <span></span>
            </div>
          ) : (
            <p className="mb-0">{message}</p>
          )}
        </div>

        {messageHistory.length > 0 && (
          <div className="ai-agent-history">
            <small className="text-muted">Historial:</small>
            <div className="history-list">
              {messageHistory.slice(0, 3).map((msg) => (
                <div key={msg.id} className="history-item">
                  <small className="text-muted">{msg.timestamp}</small>
                  <p className="mb-1 small">{msg.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {stats && (
          <div className="ai-agent-stats">
            <div className="row text-center">
              <div className="col-4">
                <small className="text-muted">Categorías</small>
                <div className="fw-bold">{stats.categories || 0}</div>
              </div>
              <div className="col-4">
                <small className="text-muted">Muestras</small>
                <div className="fw-bold">{stats.samples || 0}</div>
              </div>
              <div className="col-4">
                <small className="text-muted">Modelos</small>
                <div className="fw-bold">{stats.models || 0}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .ai-agent-container {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 1000;
          max-width: 350px;
        }

        .ai-agent-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 15px;
          padding: 15px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
        }

        .ai-agent-header {
          display: flex;
          align-items: center;
          margin-bottom: 10px;
        }

        .ai-agent-avatar {
          position: relative;
          margin-right: 10px;
        }

        .avatar-emoji {
          font-size: 24px;
          display: block;
        }

        .typing-indicator {
          position: absolute;
          bottom: -5px;
          right: -5px;
          font-size: 12px;
          animation: pulse 1s infinite;
        }

        .ai-agent-info h6 {
          color: white;
          font-weight: 600;
        }

        .ai-agent-message {
          margin-bottom: 10px;
          min-height: 20px;
        }

        .typing-animation {
          display: flex;
          gap: 3px;
        }

        .typing-animation span {
          width: 6px;
          height: 6px;
          background: white;
          border-radius: 50%;
          animation: typing 1.4s infinite;
        }

        .typing-animation span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-animation span:nth-child(3) {
          animation-delay: 0.4s;
        }

        .ai-agent-history {
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid rgba(255, 255, 255, 0.2);
        }

        .history-item {
          margin-bottom: 5px;
        }

        .ai-agent-stats {
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid rgba(255, 255, 255, 0.2);
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @keyframes typing {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  )
}

export default AIAgent