// Home.jsx
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import HeroNavbar from "../components/HeroNavbar";  
import banner from '../assets/banner.jpg'
import Footer from "../components/Footer"


// Logos
import recoLogo from '../assets/recoleccion.png'
import entrenoLogo from '../assets/entrenamiento.png'
import predLogo from '../assets/prediccion.png'
import analiticaLogo from '../assets/analitica.png'

// 🔹 Importar AOS
import AOS from "aos";
import "aos/dist/aos.css";

const Home = () => {
  const [welcomeMessage, setWelcomeMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => {
      setWelcomeMessage(
        '¡Hola! Soy tu asistente de IA. Te guiaré en la creación de tu librería de señas. ¿Listo para empezar?'
      )
      setLoading(false)
    }, 1000)

    // 🔹 Inicializar AOS
    AOS.init({ duration: 1000, once: true })
  }, [])

  const features = [
    { 
      title: 'Recolección de Datos', 
      description: 'Captura muestras de señas con guía visual y verbal.', 
      details: 'Puedes registrar múltiples usuarios, manejar sesiones y almacenar ejemplos en tu base de datos.', 
      logo: recoLogo,
      animation: "fade-up"
    },
    { 
      title: 'Entrenamiento', 
      description: 'Entrena modelos personalizados con tus datos.', 
      details: 'Utiliza redes neuronales pre-entrenadas y ajusta hiperparámetros según tus necesidades.', 
      logo: entrenoLogo,
      animation: "fade-up"
    },
    { 
      title: 'Predicción', 
      description: 'Reconoce señas en tiempo real con feedback vocal.', 
      details: 'Procesa la cámara en vivo y devuelve resultados al instante con alta precisión.', 
      logo: predLogo,
      animation: "fade-up"
    },
    { 
      title: 'Analíticas', 
      description: 'Visualiza métricas y evolución de tus modelos.', 
      details: 'Gráficas interactivas para monitorear precisión, pérdida y rendimiento general.', 
      logo: analiticaLogo,
      animation: "fade-up"
    }
  ]

  const categories = [
    { name: 'Vocales', type: 'vocales', description: 'A, E, I, O, U' },
    { name: 'Números', type: 'numeros', description: '0-9' },
    { name: 'Operaciones', type: 'operaciones', description: '+, -, *, /' },
    { name: 'Expresiones', type: 'algebraicas', description: 'Variables y operaciones' }
  ]

  return (
    <div className="home-page">

      {/* 🔹 Hero con Navbar dentro */}
      <section
        className="text-center text-white d-flex flex-column position-relative"
        style={{
          minHeight: '100vh',
          width: '100%',
          margin: 0,
          padding: 0,
          backgroundImage: `linear-gradient(rgba(22,28,38,0.85), rgba(22,28,38,0.85)), url(${banner})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <HeroNavbar />

        <div className="d-flex flex-column align-items-center justify-content-center flex-grow-1" data-aos="zoom-in">
          <h1 className="display-4 fw-bold">
            Sistema Inteligente de Reconocimiento de Señas
          </h1>
          <p className="lead mt-3">
            {loading ? 'Cargando...' : welcomeMessage}
          </p>
          <Link
            to="/prediction"
            className="btn btn-primary btn-lg rounded-pill shadow mt-3"
            data-aos="fade-up"
          >
            Empezar Ahora
          </Link>
        </div>

        {/* Ola con degradado */}
        <div className="custom-shape-divider-bottom-hero">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="heroGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#131C29" />
                <stop offset="50%" stopColor="#131D2B" />
                <stop offset="100%" stopColor="#131C29" />
              </linearGradient>
            </defs>
            <path
              d="M0,160 C480,300 960,20 1440,160 L1440,320 L0,320 Z"
              fill="url(#heroGradient)"   
            />
          </svg>
        </div>
      </section>

      {/* 🔹 Features */}
      <section className="container my-5 features-section">
        <div className="row g-4">
          {features.map((feature, index) => (
            <div key={index} className="col-md-3" data-aos={feature.animation}>
              <div className="card h-100 text-center shadow-lg border-0">
                <div className="card-body">
                  {/* Logo dentro de círculo */}
                  <div 
                    style={{
                      width: "140px",
                      height: "140px",
                      borderRadius: "50%",
                      backgroundColor: "#f5f7fa",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 5px auto",
                      boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
                    }}
                  >
                    <img 
                      src={feature.logo} 
                      alt={feature.title} 
                      style={{ width: "120px", height: "120px", objectFit: "contain" }}
                    />
                  </div>

                  <h5 className="fw-bold text-dark">{feature.title}</h5>
                  <p className="text-muted">{feature.description}</p>
                  <p className="small text-secondary">{feature.details}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 🔹 Cómo Funciona */}
      <section className="py-5 bg-light">
        <div className="container text-center">
          <h2 className="fw-bold text-dark mb-5">Cómo Funciona para Ti</h2>
          <div className="row g-4">
            {[
              { step: "1", title: "Selecciona Categoría", text: "Elige entre vocales, números o expresiones." },
              { step: "2", title: "Haz tu Seña", text: "Realiza el gesto frente a la cámara." },
              { step: "3", title: "Recibe Predicción", text: "El sistema interpreta y te muestra el resultado." }
            ].map((item, idx) => (
              <div key={idx} className="col-md-4">
                <div className="card border-0 shadow-lg p-4 h-100">
                  <div 
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "50%",
                      backgroundColor: "#0d6efd",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.5rem",
                      margin: "0 auto 15px auto"
                    }}
                  >
                    {item.step}
                  </div>
                  <h5 className="fw-bold">{item.title}</h5>
                  <p className="text-muted">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🔹 Beneficios */}
      <section className="py-5">
        <div className="container text-center">
          <h2 className="fw-bold text-dark mb-5">Beneficios de Usarlo</h2>
          <div className="row g-4">
            {[
              { icon: "⚡", title: "Acceso Rápido", text: "Disponible en cualquier navegador sin instalaciones." },
              { icon: "⏱️", title: "Predicción en Tiempo Real", text: "Resultados inmediatos al hacer tu seña." },
              { icon: "🔊", title: "Feedback Claro", text: "Visual + voz para mayor accesibilidad." }
            ].map((benefit, idx) => (
              <div key={idx} className="col-md-4">
                <div className="card border-0 shadow-lg p-4 h-100">
                  <div 
                    style={{
                      fontSize: "2rem",
                      marginBottom: "10px"
                    }}
                  >
                    {benefit.icon}
                  </div>
                  <h5 className="fw-bold">{benefit.title}</h5>
                  <p className="text-muted">{benefit.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}

export default Home
