// HeroNavbar.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import LoginModal from "./LoginModal";
import SuccessModal from "./SuccessModal";

const HeroNavbar = () => {
  const location = useLocation();
  const [showLogin, setShowLogin] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [subMessage, setSubMessage] = useState(""); // 👈 para mensajes secundarios
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem("isAuthenticated") === "true";
    setIsAuthenticated(auth);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    setSuccessMessage("Te has logueado correctamente");
    setSubMessage("Ahora podrás recolectar y entrenar datos para tu predicción");
    setShowSuccess(true);
  };

  const handleLogoutConfirmed = () => {
    localStorage.removeItem("isAuthenticated");
    setIsAuthenticated(false);
    setSuccessMessage("Sesión cerrada correctamente");
    setSubMessage("Ya no podrás recolectar ni entrenar datos hasta volver a iniciar sesión.");
    setShowSuccess(true);
  };

  const navigation = [
    { name: "Inicio", href: "/" },
    { name: "Predicción", href: "/prediction" },
    { name: "🧮 Calculadora", href: "/calculadora" },
    ...(isAuthenticated
      ? [
          { name: "Recolección de Datos", href: "/data-collection" },
          { name: "Entrenamiento ML", href: "/ml-training" },
        ]
      : []),
  ];

  const isActive = (path) => location.pathname === path;

  const navbarClass =
    location.pathname === "/"
      ? "navbar navbar-expand-lg navbar-dark bg-transparent py-3 px-5"
      : "navbar navbar-expand-lg navbar-dark py-3 px-5";
  const navbarStyle =
    location.pathname === "/" ? {} : { backgroundColor: "#131C29" };

  return (
    <>
      <nav className={navbarClass} style={navbarStyle}>
        <Link
          className="navbar-brand d-flex align-items-center fw-bold text-light"
          to="/"
        >
          <img
            src={logo}
            alt="Logo"
            style={{ height: "60px", marginRight: "10px" }}
          />
          HandSpeak AI
        </Link>

        <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
          <ul className="navbar-nav align-items-lg-center">
            {navigation.map((item) => (
              <li className="nav-item" key={item.name}>
                <Link
                  to={item.href}
                  className={`nav-link ${
                    isActive(item.href) ? "fw-bold text-info" : "text-light"
                  }`}
                >
                  {item.name}
                </Link>
              </li>
            ))}

            <li className="nav-item ms-lg-3">
              {isAuthenticated ? (
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="btn btn-danger px-4"
                >
                  Cerrar Sesión
                </button>
              ) : (
                <button
                  onClick={() => setShowLogin(true)}
                  className="btn btn-outline-info px-4"
                >
                  Iniciar Sesión
                </button>
              )}
            </li>
          </ul>
        </div>
      </nav>

      {/* Modal de Login */}
      <LoginModal
        show={showLogin}
        onClose={() => setShowLogin(false)}
        onLogin={handleLogin}
      />

      {/* Modal de Confirmación al cerrar sesión */}
      <SuccessModal
        show={showLogoutConfirm}
        message="¿Estás seguro de cerrar sesión?"
        subMessage="Ya no podrás recolectar ni entrenar datos."
        icon="warning"
        color="danger"
        autoClose={false}
        onClose={(confirmed) => {
          setShowLogoutConfirm(false);
          if (confirmed) handleLogoutConfirmed();
        }}
      />

      {/* Modal de Éxito */}
      <SuccessModal
        show={showSuccess}
        message={successMessage}
        subMessage={subMessage}
        onClose={() => setShowSuccess(false)}
      />
    </>
  );
};

export default HeroNavbar;
