import { useState, useEffect } from 'react'

export const useGlobalStats = (userId = 1) => {
  const [globalStats, setGlobalStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadGlobalStats = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Obtener estadísticas de todas las categorías
      const categories = ['vocales', 'abecedario', 'numeros', 'operaciones']
      const promises = categories.map(category => 
        fetch(`http://localhost:8000/api/v1/${category}/training-status/${userId}`)
          .then(res => res.ok ? res.json() : null)
          .catch(() => null)
      )
      
      const results = await Promise.all(promises)
      
      // Calcular totales globales
      let totalGlobal = 0
      let maxReached = false
      const breakdown = {}
      
      results.forEach((data, index) => {
        if (data) {
          totalGlobal += data.global_total_samples || 0
          if (data.max_collection_reached) {
            maxReached = true
          }
          breakdown[categories[index]] = data.global_total_samples || 0
        }
      })
      
      setGlobalStats({
        totalGlobal,
        maxReached,
        breakdown,
        canCollect: !maxReached,
        remaining: Math.max(0, 25 - totalGlobal)
      })
      
    } catch (err) {
      setError('Error cargando estadísticas globales')
      console.error('Error cargando global stats:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadGlobalStats()
  }, [userId])

  return {
    globalStats,
    loading,
    error,
    refetch: loadGlobalStats
  }
}
