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
    <>
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h1 className="sidebar-title">Sistema Inteligente</h1>
          <p className="sidebar-subtitle">Reconocimiento de Señas</p>
        </div>
        
        <nav className="sidebar-nav">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`nav-item ${isActive(item.href) ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Top Bar */}
        <div className="top-bar">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="btn btn-secondary btn-sm"
            >
              ☰ Menú
            </button>
            <h1 className="page-title">
              {navigation.find(item => item.href === location.pathname)?.name || 'Sistema'}
            </h1>
          </div>
          
          <div className="user-info">
            <div className="user-avatar">U</div>
            <span className="text-sm">Usuario</span>
          </div>
        </div>

        {/* Page Content */}
        <div className="page-content">
          <div className="content-wrapper">
            {children}
          </div>
        </div>
      </div>
    </>
  )
}

export default Layout