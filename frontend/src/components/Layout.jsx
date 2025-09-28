// Layout.jsx
import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import logo from '../assets/logo.png' // 👈 asegúrate de que esta ruta es correcta

const Layout = ({ children }) => {
  const location = useLocation()

  const navigation = [
    { name: 'Inicio', href: '/' },
    { name: 'Recolección de Datos', href: '/data-collection' },
    { name: 'Entrenamiento ML', href: '/ml-training' },
    { name: 'Predicción', href: '/prediction' },
    { name: 'Analíticas', href: '/analytics' }
  ]

  const isActive = (path) => location.pathname === path

  return (
    <div className="layout bg-dark text-light min-vh-100">
      {/* 🔹 Navbar estilo Softy Pinko con logo */}
      <nav
        className="navbar navbar-expand-lg bg-white shadow rounded-pill mx-auto mt-3 px-4"
        style={{ width: '75%' }}
      >
        {/* Logo + Nombre */}
        <Link
          className="navbar-brand d-flex align-items-center fw-bold text-primary"
          to="/"
        >
          <img
            src={logo}
            alt="Logo"
            style={{ height: '65px', marginRight: '6px' }} // 👈 logo más grande y menos separación
          />
          <span style={{ fontSize: '1.4rem' }}>HandSpeak AI</span> {/* 👈 texto un poco más grande */}
        </Link>

        {/* Botón hamburguesa responsive */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Links de navegación */}
        <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
          <ul className="navbar-nav">
            {navigation.map((item) => (
              <li className="nav-item" key={item.name}>
                <Link
                  to={item.href}
                  className={`nav-link ${
                    isActive(item.href) ? 'fw-bold text-primary' : 'text-dark'
                  }`}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* 🔹 Contenido dinámico */}
      <main className="container-fluid py-5">{children}</main>
    </div>
  )
}

export default Layout
