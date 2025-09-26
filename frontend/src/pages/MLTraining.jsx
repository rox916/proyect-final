import React, { useState, useEffect } from 'react'

const MLTraining = () => {
  const [isTraining, setIsTraining] = useState(false)
  const [trainingResult, setTrainingResult] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('numeros')
  const [stats, setStats] = useState(null)

  const categories = {
    numeros: 'Números 0-9',
    vocales: 'Vocales A, E, I, O, U',
    operaciones: 'Operaciones +, -, *, /, =',
    abecedario: 'Abecedario A-Z'
  }

  useEffect(() => {
    fetchStats()
  }, [selectedCategory])

  const fetchStats = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/${selectedCategory}/stats/1`)
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error)
    }
  }

  const trainModel = async () => {
    setIsTraining(true)
    setTrainingResult(null)
    
    try {
      const response = await fetch(`http://localhost:8000/api/v1/${selectedCategory}/train/1`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (response.ok) {
        const result = await response.json()
        setTrainingResult(result)
      } else {
        setTrainingResult({
          success: false,
          message: 'Error entrenando modelo',
          accuracy: 0
        })
      }
    } catch (error) {
      setTrainingResult({
        success: false,
        message: `Error de conexión: ${error.message}`,
        accuracy: 0
      })
    } finally {
      setIsTraining(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Entrenamiento de Modelo ML</h1>
          <p className="card-subtitle">Entrena modelos de Machine Learning con tus datos</p>
        </div>
      </div>

      {/* Category Selection */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Seleccionar Categoría</h2>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(categories).map(([key, name]) => (
              <div key={key} className="border rounded p-4">
                <h3 className="font-semibold mb-2">{name}</h3>
                <button
                  onClick={() => setSelectedCategory(key)}
                  className={`btn btn-sm w-full ${
                    selectedCategory === key ? 'btn-primary' : 'btn-secondary'
                  }`}
                >
                  {selectedCategory === key ? 'Seleccionado' : 'Seleccionar'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Data Statistics */}
      {stats && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Estadísticas de Datos</h2>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {stats.total_samples || 0}
                </div>
                <div className="text-sm text-secondary">Total Muestras</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-success">
                  {Object.keys(stats.signs || {}).length}
                </div>
                <div className="text-sm text-secondary">Señas Diferentes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-info">
                  {Object.values(stats.signs || {}).reduce((sum, sign) => sum + (sign.samples || 0), 0)}
                </div>
                <div className="text-sm text-secondary">Muestras por Seña</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">Distribución por Seña:</h4>
              <div className="grid grid-cols-5 gap-2">
                {Object.entries(stats.signs || {}).map(([sign, data]) => (
                  <div key={sign} className="border rounded p-2 text-center">
                    <div className="font-bold">{sign}</div>
                    <div className="text-sm text-secondary">
                      {data.samples || 0} muestras
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Training Controls */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Entrenar Modelo</h2>
        </div>
        <div className="card-body">
          <div className="space-y-4">
            <div className="alert alert-info">
              <strong>ℹ️ Información:</strong> El entrenamiento usa Random Forest para clasificar 
              las señas basándose en los landmarks de la mano. Se requiere al menos 2 muestras 
              por seña para un entrenamiento efectivo.
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={trainModel}
                disabled={isTraining || !stats || stats.total_samples < 10}
                className="btn btn-primary btn-lg"
              >
                {isTraining ? 'Entrenando...' : 'Entrenar Modelo'}
              </button>
              
              <button
                onClick={fetchStats}
                className="btn btn-secondary"
              >
                🔄 Actualizar Estadísticas
              </button>
            </div>
            
            {!stats || stats.total_samples < 10 ? (
              <div className="alert alert-warning">
                <strong>⚠️ Datos insuficientes:</strong> Necesitas al menos 10 muestras 
                para entrenar un modelo efectivo. Ve a "Recolección de Datos" para agregar más muestras.
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Training Results */}
      {trainingResult && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Resultados del Entrenamiento</h2>
          </div>
          <div className="card-body">
            <div className={`alert ${trainingResult.success ? 'alert-success' : 'alert-error'}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">
                  {trainingResult.success ? '✅' : '❌'}
                </span>
                <span className="font-semibold">
                  {trainingResult.success ? 'Entrenamiento Exitoso' : 'Error en Entrenamiento'}
                </span>
              </div>
              <p className="mb-2">{trainingResult.message}</p>
              
              {trainingResult.success && (
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-success">
                      {(trainingResult.accuracy * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-secondary">Precisión</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-primary">
                      {trainingResult.samples}
                    </div>
                    <div className="text-sm text-secondary">Muestras</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-info">
                      {trainingResult.classes?.length || 0}
                    </div>
                    <div className="text-sm text-secondary">Clases</div>
                  </div>
                </div>
              )}
            </div>
            
            {trainingResult.success && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Clases entrenadas:</h4>
                <div className="flex flex-wrap gap-2">
                  {trainingResult.classes?.map((cls, index) => (
                    <span key={index} className="badge badge-primary">
                      {cls}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Consejos para Mejor Entrenamiento</h2>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">📊 Datos</h4>
              <ul className="text-sm text-secondary space-y-1">
                <li>• Mínimo 5 muestras por seña</li>
                <li>• Variedad en ángulos y posiciones</li>
                <li>• Buena iluminación consistente</li>
                <li>• Gestos claros y definidos</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">🤖 Modelo</h4>
              <ul className="text-sm text-secondary space-y-1">
                <li>• Random Forest para robustez</li>
                <li>• Entrenamiento automático</li>
                <li>• Validación cruzada</li>
                <li>• Guardado automático</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MLTraining
