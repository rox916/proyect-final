import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AIAgent from '../components/AIAgent'

const Home = () => {
  const [welcomeMessage, setWelcomeMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simular carga del mensaje de bienvenida
    setTimeout(() => {
      setWelcomeMessage('¡Hola! Soy tu asistente de IA. Te guiaré en la creación de tu librería de señas. ¿Listo para empezar?')
      setLoading(false)
    }, 1000)
  }, [])

  const features = [
    {
      title: 'Recolección de Datos',
      description: 'Captura muestras de señas con guía visual y verbal',
      icon: '📊',
      link: '/data-collection'
    },
    {
      title: 'Entrenamiento',
      description: 'Entrena modelos personalizados con tus datos',
      icon: '🧠',
      link: '/training'
    },
    {
      title: 'Predicción',
      description: 'Reconoce señas en tiempo real con feedback vocal',
      icon: '🔮',
      link: '/prediction'
    },
    {
      title: 'Analíticas',
      description: 'Visualiza métricas y evolución de tus modelos',
      icon: '📈',
      link: '/analytics'
    }
  ]

  const categories = [
    { name: 'Vocales', type: 'vocales', description: 'A, E, I, O, U' },
    { name: 'Números', type: 'numeros', description: '0-9' },
    { name: 'Operaciones', type: 'operaciones', description: '+, -, *, /' },
    { name: 'Expresiones', type: 'algebraicas', description: 'Variables y operaciones' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="card-body">
          <h1 className="text-2xl font-bold text-center mb-4">
            Sistema Inteligente de Reconocimiento de Señas
          </h1>
          
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="spinner"></div>
              <span className="ml-2">Cargando...</span>
            </div>
          ) : (
            <div className="alert alert-info text-center">
              <p className="text-lg">{welcomeMessage}</p>
            </div>
          )}
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-2 gap-4">
        {features.map((feature, index) => (
          <Link
            key={index}
            to={feature.link}
            className="card hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="card-body text-center">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-secondary">{feature.description}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Categories */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Categorías Disponibles</h2>
          <p className="card-subtitle">Selecciona qué tipo de señas quieres entrenar</p>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-2 gap-4">
            {categories.map((category, index) => (
              <div key={index} className="border rounded p-4 hover:shadow transition-shadow">
                <h3 className="font-semibold mb-2">{category.name}</h3>
                <p className="text-sm text-secondary mb-3">{category.description}</p>
                <Link
                  to={`/data-collection?category=${category.type}`}
                  className="btn btn-primary btn-sm"
                >
                  Empezar
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="card-body">
            <div className="text-2xl font-bold text-primary">0</div>
            <div className="text-sm text-secondary">Categorías</div>
          </div>
        </div>
        <div className="card text-center">
          <div className="card-body">
            <div className="text-2xl font-bold text-success">0</div>
            <div className="text-sm text-secondary">Muestras</div>
          </div>
        </div>
        <div className="card text-center">
          <div className="card-body">
            <div className="text-2xl font-bold text-warning">0</div>
            <div className="text-sm text-secondary">Modelos</div>
          </div>
        </div>
        <div className="card text-center">
          <div className="card-body">
            <div className="text-2xl font-bold text-error">0%</div>
            <div className="text-sm text-secondary">Precisión</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home