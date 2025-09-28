import React, { useState } from 'react'
import MediaPipeCamera from '../components/MediaPipeCamera'

const GalleryPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('predicciones')
  const [landmarks, setLandmarks] = useState(null)
  const [isHandDetected, setIsHandDetected] = useState(false)

  const galleryItems = [
    {
      id: 1,
      title: 'Vocales en Señas',
      description: 'A E I O U',
      date: '18 Oct 2020',
      views: '9,906 views',
      image: '/api/placeholder/300/200',
      category: 'vocales',
      color: '#1e40af', // Azul oscuro
      bgColor: '#3b82f6' // Azul
    },
    {
      id: 2,
      title: 'Operaciones Matemáticas',
      description: '+ - × ÷',
      date: '14 Oct 2020',
      views: '16,100 views',
      image: '/api/placeholder/300/200',
      category: 'operaciones',
      color: '#059669', // Verde
      bgColor: '#10b981' // Verde claro
    },
    {
      id: 3,
      title: 'Números del 0-9',
      description: '0 1 2 3 4 5 6 7 8 9',
      date: '12 Oct 2020',
      views: '12,460 views',
      image: '/api/placeholder/300/200',
      category: 'numeros',
      color: '#d97706', // Amarillo
      bgColor: '#f59e0b' // Amarillo claro
    },
    {
      id: 4,
      title: 'Abecedario Completo',
      description: 'A B C D E F G H I J K L M N O P Q R S T U V W X Y Z',
      date: '10 Oct 2020',
      views: '11,402 views',
      image: '/api/placeholder/300/200',
      category: 'abecedario',
      color: '#ec4899', // Rosa
      bgColor: '#f472b6' // Rosa claro
    }
  ]

  const filteredItems = galleryItems.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleLandmarks = (newLandmarks) => {
    setLandmarks(newLandmarks)
  }

  const handleHandDetected = (detected) => {
    setIsHandDetected(detected)
  }

  const handleTabClick = (tab) => {
    setActiveTab(tab)
  }

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header Section */}
      <div className="container-fluid py-4">
        <div className="row mb-4">
          <div className="col-12">
            <h1 className="display-4 fw-bold text-dark mb-0">Sistema Inteligente</h1>
            <p className="text-dark fs-5">Reconocimiento de Señas</p>
          </div>
        </div>

        {/* Navigation Bar */}
        <div className="row mb-4">
          <div className="col-12">
            <nav className="navbar navbar-expand-lg navbar-light">
              <div className="container-fluid">
                <div className="navbar-nav me-auto">
                  <a className="nav-link text-primary text-decoration-underline" href="/">🏠 Inicio</a>
                  <a className="nav-link text-primary text-decoration-underline" href="/gallery">🖼️ Galería</a>
                  <a className="nav-link text-primary text-decoration-underline" href="/data-collection">📊 Recolección de Datos</a>
                  <a className="nav-link text-primary text-decoration-underline" href="/ml-training">🤖 Entrenamiento ML</a>
                  <a className="nav-link text-primary text-decoration-underline" href="/prediction">🔮 Predicción</a>
                  <a className="nav-link text-primary text-decoration-underline" href="/analytics">📈 Analíticas</a>
                </div>
                <button className="btn btn-secondary">
                  ☰ Menú
                </button>
              </div>
            </nav>
          </div>
        </div>

        {/* Main Content Header */}
        <div className="row mb-4">
          <div className="col-12">
            <h2 className="display-5 fw-bold text-dark mb-0">Galería</h2>
            <p className="text-muted">U Usuario</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-fluid py-4">
        {/* Search Bar */}
        <div className="row mb-4">
          <div className="col-md-8 mx-auto">
            <div className="input-group">
              <input
                type="text"
                className="form-control form-control-lg"
                placeholder="Buscar señas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="btn btn-primary btn-lg" type="button">
                <i className="bi bi-search"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Gallery Header */}
        <div className="row mb-4">
          <div className="col-md-6">
            <h2 className="h3 fw-bold">Últimas Señas</h2>
          </div>
          <div className="col-md-6 text-end">
            <span className="text-muted">Página 1 de 200</span>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="row g-4">
          {filteredItems.map((item) => (
            <div key={item.id} className="col-lg-3 col-md-6">
              <div className="card h-100 shadow-sm border-0">
                <div 
                  className="card-img-top position-relative" 
                  style={{ 
                    height: '200px', 
                    backgroundColor: item.bgColor,
                    background: `linear-gradient(135deg, ${item.bgColor}20, ${item.bgColor}40)`
                  }}
                >
                  <div className="d-flex align-items-center justify-content-center h-100">
                    <div className="text-center text-white">
                      <div className="display-1 mb-2">
                        {item.category === 'vocales' && '👋'}
                        {item.category === 'operaciones' && '🔢'}
                        {item.category === 'numeros' && '🔢'}
                        {item.category === 'abecedario' && '📚'}
                      </div>
                      <h5 className="fw-bold">{item.title}</h5>
                      <p className="small opacity-75">{item.description}</p>
                    </div>
                  </div>
                </div>
                <div className="card-body bg-white">
                  <div className="d-flex justify-content-between align-items-center">
                    <small className="text-muted">{item.date}</small>
                    <small className="text-muted">{item.views}</small>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="row mt-5">
          <div className="col-12">
            <nav aria-label="Gallery pagination">
              <ul className="pagination justify-content-center">
                <li className="page-item disabled">
                  <span className="page-link">Anterior</span>
                </li>
                <li className="page-item active">
                  <span className="page-link">1</span>
                </li>
                <li className="page-item">
                  <a className="page-link" href="#2">2</a>
                </li>
                <li className="page-item">
                  <a className="page-link" href="#3">3</a>
                </li>
                <li className="page-item">
                  <span className="page-link">...</span>
                </li>
                <li className="page-item">
                  <a className="page-link" href="#200">200</a>
                </li>
                <li className="page-item">
                  <a className="page-link" href="#next">Siguiente</a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GalleryPage
