import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000/api/v1'

const aiAgentService = {
  // Obtener mensaje de bienvenida
  async getWelcomeMessage(userId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/ai-agent/welcome/${userId}`)
      return response.data
    } catch (error) {
      console.error('Error obteniendo mensaje de bienvenida:', error)
      return {
        message: '¡Hola! Soy tu asistente de IA. Te guiaré en la creación de tu librería de señas.',
        type: 'welcome',
        timestamp: new Date().toISOString()
      }
    }
  },

  // Obtener guía de captura
  async getCaptureGuidance(userId, categoryName) {
    try {
      const response = await axios.get(`${API_BASE_URL}/ai-agent/guidance/${userId}/${categoryName}`)
      return response.data
    } catch (error) {
      console.error('Error obteniendo guía de captura:', error)
      return {
        message: 'Por favor, realiza la seña. Asegúrate de que tu mano esté bien visible.',
        type: 'guidance',
        timestamp: new Date().toISOString()
      }
    }
  },

  // Obtener retroalimentación del entrenamiento
  async getTrainingFeedback(userId, accuracy) {
    try {
      const response = await axios.get(`${API_BASE_URL}/ai-agent/feedback/${userId}/${accuracy}`)
      return response.data
    } catch (error) {
      console.error('Error obteniendo retroalimentación:', error)
      return {
        message: `Tu modelo tiene una precisión del ${(accuracy * 100).toFixed(1)}%.`,
        type: 'feedback',
        data: { accuracy },
        timestamp: new Date().toISOString()
      }
    }
  },

  // Obtener analíticas del usuario
  async getAnalytics(userId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/analytics/${userId}`)
      return response.data
    } catch (error) {
      console.error('Error obteniendo analíticas:', error)
      return {
        total_categories: 0,
        total_samples: 0,
        total_models: 0,
        category_distribution: {},
        accuracy_evolution: [],
        recommendations: []
      }
    }
  },

  // Reproducir mensaje con voz
  speakMessage(message, options = {}) {
    if ('speechSynthesis' in window) {
      // Detener cualquier síntesis anterior inmediatamente
      speechSynthesis.cancel()
      
      const utterance = new SpeechSynthesisUtterance(message)
      utterance.rate = options.rate || 1.8  // Mucho más rápido por defecto
      utterance.pitch = options.pitch || 1.0
      utterance.volume = options.volume || 0.9
      utterance.lang = options.lang || 'es-ES'
      
      // Configurar voz optimizada
      const voices = speechSynthesis.getVoices()
      const spanishVoice = voices.find(voice => 
        voice.lang.startsWith('es') && (voice.name.includes('Microsoft') || voice.name.includes('Google'))
      ) || voices.find(voice => voice.lang.startsWith('es'))
      
      if (spanishVoice) {
        utterance.voice = spanishVoice
      }
      
      // Reproducir inmediatamente
      speechSynthesis.speak(utterance)
    }
  },

  // Detener síntesis de voz
  stopSpeaking() {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel()
    }
  },

  // Obtener recomendaciones personalizadas
  getRecommendations(analytics) {
    const recommendations = []
    
    if (analytics.total_samples < 50) {
      recommendations.push('Captura más muestras para mejorar la precisión de tus modelos')
    }
    
    if (analytics.average_accuracy < 0.8) {
      recommendations.push('Considera reentrenar tus modelos con más datos diversos')
    }
    
    if (analytics.total_categories < 3) {
      recommendations.push('Explora diferentes categorías de señas para ampliar tu librería')
    }
    
    return recommendations
  }
}

export default aiAgentService
