import React from "react"
import { Link } from "react-router-dom"

const Footer = () => {
  return (
    <footer className="text-white text-center py-4" style={{ background: "#131C29" }}>
      <div className="container">
        <h5 className="fw-bold">HandSpeak AI</h5>
        <p className="mb-1">Sistema Inteligente de Reconocimiento de Señas</p>
        <p className="small mb-2">
          © {new Date().getFullYear()} HandSpeak AI. Todos los derechos reservados.
        </p>
        <div>
          <Link to="/" className="text-white me-3 text-decoration-none">Inicio</Link>
          <Link to="/prediction" className="text-white me-3 text-decoration-none">Predicción</Link>
          <Link to="/analytics" className="text-white me-3 text-decoration-none">Analíticas</Link>
          <Link to="/about" className="text-white me-3 text-decoration-none">Acerca de</Link>
          <Link to="/contact" className="text-white text-decoration-none">Contacto</Link>
        </div>
      </div>
    </footer>
  )
}

export default Footer
