import { useState, useEffect } from 'react'
import aiAgentService from '../services/aiAgent'

export const useAIAgent = (userId = 1) => {
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentMessage, setCurrentMessage] = useState('')

  const addMessage = (message, type = 'info') => {
    const newMessage = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date().toISOString()
    }
    setMessages(prev => [newMessage, ...prev.slice(0, 9)]) // Mantener últimas 10
    setCurrentMessage(message)
  }

  const getWelcomeMessage = async () => {
    setIsLoading(true)
    try {
      const response = await aiAgentService.getWelcomeMessage(userId)
      addMessage(response.message, 'welcome')
      return response
    } catch (error) {
      console.error('Error obteniendo mensaje de bienvenida:', error)
      addMessage('¡Hola! Soy tu asistente de IA. Te guiaré en la creación de tu librería de señas.', 'welcome')
    } finally {
      setIsLoading(false)
    }
  }

  const getCaptureGuidance = async (categoryName) => {
    setIsLoading(true)
    try {
      const response = await aiAgentService.getCaptureGuidance(userId, categoryName)
      addMessage(response.message, 'guidance')
      return response
    } catch (error) {
      console.error('Error obteniendo guía de captura:', error)
      addMessage('Por favor, realiza la seña. Asegúrate de que tu mano esté bien visible.', 'guidance')
    } finally {
      setIsLoading(false)
    }
  }

  const getTrainingFeedback = async (accuracy) => {
    setIsLoading(true)
    try {
      const response = await aiAgentService.getTrainingFeedback(userId, accuracy)
      addMessage(response.message, 'feedback')
      return response
    } catch (error) {
      console.error('Error obteniendo retroalimentación:', error)
      addMessage(`Tu modelo tiene una precisión del ${(accuracy * 100).toFixed(1)}%.`, 'feedback')
    } finally {
      setIsLoading(false)
    }
  }

  const getPredictionFeedback = (prediction, confidence) => {
    const message = `Se detectó la seña de "${prediction}" con una confianza del ${(confidence * 100).toFixed(1)}%.`
    addMessage(message, 'prediction')
  }

  const speakMessage = (message, options = {}) => {
    aiAgentService.speakMessage(message, options)
  }

  const stopSpeaking = () => {
    aiAgentService.stopSpeaking()
  }

  const clearMessages = () => {
    setMessages([])
    setCurrentMessage('')
  }


  const getRecommendations = (analytics) => {
    return aiAgentService.getRecommendations(analytics)
  }

  return {
    messages,
    currentMessage,
    isLoading,
    addMessage,
    getWelcomeMessage,
    getCaptureGuidance,
    getTrainingFeedback,
    getPredictionFeedback,
    speakMessage,
    stopSpeaking,
    clearMessages,
    getRecommendations
  }
}
