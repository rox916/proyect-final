// HeroNavbar.jsx
import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import logo from '../assets/logo.png'

const HeroNavbar = () => {
  const location = useLocation()
  const navigation = [
    { name: 'Inicio', href: '/' },
    { name: 'Recolección de Datos', href: '/data-collection' },
    { name: 'Entrenamiento ML', href: '/ml-training' },
    { name: 'Predicción', href: '/prediction' },
    { name: 'Analíticas', href: '/analytics' }
  ]

  const isActive = (path) => location.pathname === path

  // 🔹 Si estamos en "/" el navbar será transparente, en el resto será oscuro
  const navbarClass =
    location.pathname === '/'
      ? 'navbar navbar-expand-lg navbar-dark bg-transparent py-3 px-5'
      : 'navbar navbar-expand-lg navbar-dark py-3 px-5'
  const navbarStyle =
    location.pathname === '/' ? {} : { backgroundColor: '#131C29' }

  return (
    <nav className={navbarClass} style={navbarStyle}>
      <Link
        className="navbar-brand d-flex align-items-center fw-bold text-light"
        to="/"
      >
        <img
          src={logo}
          alt="Logo"
          style={{ height: '60px', marginRight: '10px' }}
        />
        HandSpeak AI
      </Link>
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

      <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
        <ul className="navbar-nav">
          {navigation.map((item) => (
            <li className="nav-item" key={item.name}>
              <Link
                to={item.href}
                className={`nav-link ${
                  isActive(item.href) ? 'fw-bold text-info' : 'text-light'
                }`}
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}

export default HeroNavbar
