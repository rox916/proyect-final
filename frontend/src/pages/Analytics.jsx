import React, { useState, useEffect } from 'react'

const Analytics = () => {
  const [analytics, setAnalytics] = useState({
    totalCategories: 0,
    totalSamples: 0,
    totalModels: 0,
    averageAccuracy: 0,
    categoryDistribution: {},
    accuracyEvolution: [],
    recommendations: []
  })

  const [selectedTimeframe, setSelectedTimeframe] = useState('week')
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    // Simular carga de datos de analíticas
    setAnalytics({
      totalCategories: 3,
      totalSamples: 150,
      totalModels: 2,
      averageAccuracy: 0.89,
      categoryDistribution: {
        vocales: 50,
        numeros: 40,
        operaciones: 60
      },
      accuracyEvolution: [
        { date: '2024-01-01', accuracy: 0.75 },
        { date: '2024-01-02', accuracy: 0.82 },
        { date: '2024-01-03', accuracy: 0.85 },
        { date: '2024-01-04', accuracy: 0.88 },
        { date: '2024-01-05', accuracy: 0.89 }
      ],
      recommendations: [
        'Añade más muestras a la categoría "Números" para mejorar la precisión',
        'Considera reentrenar el modelo de "Operaciones" con datos más diversos',
        'La categoría "Vocales" tiene excelente rendimiento'
      ]
    })
  }, [])

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 0.9) return 'text-success'
    if (accuracy >= 0.8) return 'text-warning'
    return 'text-error'
  }

  const getAccuracyText = (accuracy) => {
    if (accuracy >= 0.9) return 'Excelente'
    if (accuracy >= 0.8) return 'Bueno'
    if (accuracy >= 0.7) return 'Regular'
    return 'Necesita mejora'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Analíticas y Métricas</h1>
          <p className="card-subtitle">Visualiza el rendimiento de tus modelos y datos</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <div className="flex gap-4">
            <div>
              <label className="form-label">Período:</label>
              <select 
                value={selectedTimeframe} 
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="form-select"
              >
                <option value="week">Última semana</option>
                <option value="month">Último mes</option>
                <option value="year">Último año</option>
              </select>
            </div>
            <div>
              <label className="form-label">Categoría:</label>
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="form-select"
              >
                <option value="all">Todas las categorías</option>
                <option value="vocales">Vocales</option>
                <option value="numeros">Números</option>
                <option value="operaciones">Operaciones</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="card-body">
            <div className="text-3xl font-bold text-primary mb-2">
              {analytics.totalCategories}
            </div>
            <div className="text-sm text-secondary">Categorías</div>
          </div>
        </div>
        
        <div className="card text-center">
          <div className="card-body">
            <div className="text-3xl font-bold text-success mb-2">
              {analytics.totalSamples}
            </div>
            <div className="text-sm text-secondary">Muestras</div>
          </div>
        </div>
        
        <div className="card text-center">
          <div className="card-body">
            <div className="text-3xl font-bold text-warning mb-2">
              {analytics.totalModels}
            </div>
            <div className="text-sm text-secondary">Modelos</div>
          </div>
        </div>
        
        <div className="card text-center">
          <div className="card-body">
            <div className={`text-3xl font-bold mb-2 ${getAccuracyColor(analytics.averageAccuracy)}`}>
              {(analytics.averageAccuracy * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-secondary">Precisión Promedio</div>
          </div>
        </div>
      </div>

      {/* Category Distribution */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Distribución de Muestras por Categoría</h2>
          <p className="card-subtitle">Visualiza cuántas muestras tienes en cada categoría</p>
        </div>
        <div className="card-body">
          <div className="space-y-4">
            {Object.entries(analytics.categoryDistribution).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-primary"></div>
                  <span className="font-semibold capitalize">{category}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${(count / Math.max(...Object.values(analytics.categoryDistribution))) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold w-12 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Accuracy Evolution */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Evolución de la Precisión</h2>
          <p className="card-subtitle">Cómo ha mejorado la precisión de tus modelos a lo largo del tiempo</p>
        </div>
        <div className="card-body">
          <div className="h-64 flex items-end justify-between gap-2">
            {analytics.accuracyEvolution.map((point, index) => (
              <div key={index} className="flex flex-col items-center gap-2">
                <div 
                  className="bg-primary rounded-t"
                  style={{ 
                    height: `${point.accuracy * 200}px`,
                    width: '40px'
                  }}
                ></div>
                <div className="text-xs text-secondary">
                  {(point.accuracy * 100).toFixed(0)}%
                </div>
                <div className="text-xs text-secondary">
                  {new Date(point.date).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Model Performance */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Rendimiento por Modelo</h2>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Modelo Vocales</span>
                <div className="flex items-center gap-2">
                  <span className="text-success">95%</span>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div className="bg-success h-2 rounded-full" style={{ width: '95%' }}></div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-semibold">Modelo Números</span>
                <div className="flex items-center gap-2">
                  <span className="text-warning">87%</span>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div className="bg-warning h-2 rounded-full" style={{ width: '87%' }}></div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-semibold">Modelo Operaciones</span>
                <div className="flex items-center gap-2">
                  <span className="text-success">92%</span>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div className="bg-success h-2 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recomendaciones de IA</h2>
          </div>
          <div className="card-body">
            <div className="space-y-3">
              {analytics.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center flex-shrink-0">
                    {index + 1}
                  </div>
                  <p className="text-sm text-secondary">{recommendation}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Data Quality */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Calidad de los Datos</h2>
          <p className="card-subtitle">Métricas de calidad de tus muestras capturadas</p>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-success mb-2">98%</div>
              <div className="text-sm text-secondary">Muestras Válidas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning mb-2">12%</div>
              <div className="text-sm text-secondary">Muestras Duplicadas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-2">85%</div>
              <div className="text-sm text-secondary">Calidad Promedio</div>
            </div>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Exportar Datos</h2>
          <p className="card-subtitle">Descarga tus analíticas y datos</p>
        </div>
        <div className="card-body">
          <div className="flex gap-4">
            <button className="btn btn-primary">
              📊 Exportar Analíticas
            </button>
            <button className="btn btn-secondary">
              📈 Exportar Gráficos
            </button>
            <button className="btn btn-secondary">
              📋 Exportar Reporte
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics