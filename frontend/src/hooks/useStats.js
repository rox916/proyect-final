import { useState, useEffect } from 'react'

export const useStats = (category, userId = 1) => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadStats = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`http://localhost:8000/api/v1/${category}/stats/${userId}`)
      
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        setError('Error cargando estadísticas')
      }
    } catch (err) {
      setError('Error de conexión')
      console.error('Error cargando stats:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (category) {
      loadStats()
    }
  }, [category, userId])

  return {
    stats,
    loading,
    error,
    refetch: loadStats
  }
}
