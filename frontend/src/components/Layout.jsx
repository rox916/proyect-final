import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  const navigation = [
    { name: 'Inicio', href: '/', icon: '🏠' },
    { name: 'Recolección de Datos', href: '/data-collection', icon: '📊' },
    { name: 'Entrenamiento ML', href: '/ml-training', icon: '🤖' },
    { name: 'Predicción', href: '/prediction', icon: '🔮' },
    { name: 'Analíticas', href: '/analytics', icon: '📈' }
  ]

  const isActive = (path) => location.pathname === path

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header Section */}
      <div className="container-fluid py-4">
        <div className="row mb-4 align-items-center">
          <div className="col-md-6">
            <h1 className="display-4 fw-bold text-dark mb-0">HAND SPEAK AI</h1>
            <p className="text-dark fs-5">Reconocimiento de Señas</p>
          </div>
          <div className="col-md-6">
            <nav className="navbar navbar-expand-lg navbar-light">
              <div className="container-fluid">
                <div className="navbar-nav me-auto">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`nav-link text-primary ${isActive(item.href) ? 'text-decoration-underline' : ''}`}
                    >
                      {item.icon} {item.name}
                    </Link>
                  ))}
                </div>
                <button 
                  className="btn btn-secondary"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                  ☰ Menú
                </button>
              </div>
            </nav>
          </div>
        </div>

        {/* Main Content Header */}
        <div className="row mb-4">
          <div className="col-12">
            <h2 className="display-5 fw-bold text-dark mb-0">
              {navigation.find(item => item.href === location.pathname)?.name || 'Sistema'}
            </h2>
            <p className="text-muted">U Usuario</p>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="container-fluid py-4">
        <div className="content-wrapper">
          {children}
        </div>
      </div>
    </div>
  )
}

export default Layout