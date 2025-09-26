import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000/api/v1'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Users
export const getUser = async (userId) => {
  const response = await api.get(`/users/${userId}`)
  return response.data
}
export const createUser = async (userData) => {
  const response = await api.post('/users/', userData)
  return response.data
}
export const updateUser = async (userId, userData) => {
  const response = await api.put(`/users/${userId}`, userData)
  return response.data
}
export const deleteUser = async (userId) => {
  const response = await api.delete(`/users/${userId}`)
  return response.data
}

// Categories - Funciones no utilizadas removidas
export const getCategorySamplesCount = async (categoryId) => {
  const response = await api.get(`/categories/${categoryId}/samples-count`)
  return response.data
}

// Samples
export const createSample = async (sampleData, categoryId, userId) => {
  const response = await api.post('/samples/', sampleData, {
    params: { category_id: categoryId, user_id: userId }
  })
  return response.data
}
export const getCategorySamples = async (categoryId) => {
  const response = await api.get(`/samples/category/${categoryId}`)
  return response.data
}
export const getUserSamples = async (userId) => {
  const response = await api.get(`/samples/user/${userId}`)
  return response.data
}
export const getSample = async (sampleId) => {
  const response = await api.get(`/samples/${sampleId}`)
  return response.data
}
export const updateSample = async (sampleId, sampleData) => {
  const response = await api.put(`/samples/${sampleId}`, sampleData)
  return response.data
}
export const deleteSample = async (sampleId) => {
  const response = await api.delete(`/samples/${sampleId}`)
  return response.data
}
export const deleteCategorySamples = async (categoryId) => {
  const response = await api.delete(`/samples/category/${categoryId}`)
  return response.data
}

// Models
export const getUserModels = async (userId) => {
  const response = await api.get(`/models/user/${userId}`)
  return response.data
}
export const createModel = async (userId, modelData) => {
  const response = await api.post('/models/', modelData, {
    params: { user_id: userId }
  })
  return response.data
}
export const trainModel = async (modelId) => {
  const response = await api.post(`/models/${modelId}/train`)
  return response.data
}
export const predict = async (modelId, predictionData) => {
  const response = await api.post(`/models/${modelId}/predict`, predictionData)
  return response.data
}
export const getModel = async (modelId) => {
  const response = await api.get(`/models/${modelId}`)
  return response.data
}
export const updateModel = async (modelId, modelData) => {
  const response = await api.put(`/models/${modelId}`, modelData)
  return response.data
}
export const deleteModel = async (modelId) => {
  const response = await api.delete(`/models/${modelId}`)
  return response.data
}

// Hand Detection
export const detectHands = async (imageData) => {
  const response = await api.post('/hand-detection/detect', imageData)
  return response.data
}
export const extractFeatures = async (landmarksData) => {
  const response = await api.post('/hand-detection/extract-features', landmarksData)
  return response.data
}
export const validateHand = async (landmarksData) => {
  const response = await api.post('/hand-detection/validate-hand', landmarksData)
  return response.data
}

// AI Agent
export const getWelcomeMessage = async (userId) => {
  const response = await api.post(`/ai-agent/welcome/${userId}`)
  return response.data
}
export const getCaptureGuidance = async (userId, categoryName) => {
  const response = await api.post(`/ai-agent/guidance/${userId}`, null, {
    params: { category_name: categoryName }
  })
  return response.data
}
export const getTrainingFeedback = async (userId, modelId) => {
  const response = await api.post(`/ai-agent/feedback/${userId}`, null, {
    params: { model_id: modelId }
  })
  return response.data
}
export const getPredictionFeedback = async (predictionData) => {
  const response = await api.post('/ai-agent/prediction-feedback', predictionData)
  return response.data
}

// Create apiService object with all functions
const apiService = {
  // Users
  getUser,
  createUser,
  updateUser,
  deleteUser,
  
  // Categories
  getCategorySamplesCount,
  
  // Samples
  createSample,
  getCategorySamples,
  getUserSamples,
  getSample,
  updateSample,
  deleteSample,
  deleteCategorySamples,
  
  // Models
  getUserModels,
  createModel,
  trainModel,
  predict,
  getModel,
  updateModel,
  deleteModel,
  
  // Hand Detection
  detectHands,
  extractFeatures,
  validateHand,
  
  // AI Agent
  getWelcomeMessage,
  getCaptureGuidance,
  getTrainingFeedback,
  getPredictionFeedback
}

export { apiService as api }
