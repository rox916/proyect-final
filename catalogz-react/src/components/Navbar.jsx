// src/components/Navbar.jsx
import { NavLink, Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg">
      <div className="container-fluid">
        {/* Logo + Nombre */}
        <Link className="navbar-brand me-5 d-flex align-items-center" to="/">
          <img
            src="/img/Logo.png"  // ✅ Usando public/img
            alt="HandSpeak AI Logo"
            style={{ height: "50px", marginRight: "2px" }}
          />
          HandSpeak AI
        </Link>

        {/* Botón hamburguesa en móvil */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <i className="fas fa-bars"></i>
        </button>

        {/* Menú */}
        <div
          className="collapse navbar-collapse justify-content-end"
          id="navbarSupportedContent"
        >
          <ul className="navbar-nav mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `nav-link nav-link-1 ${isActive ? "active" : ""}`
                }
                end
              >
                Predicciones
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                to="/training"
                className={({ isActive }) =>
                  `nav-link nav-link-2 ${isActive ? "active" : ""}`
                }
              >
                Entrenamiento
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                to="/modelo"
                className={({ isActive }) =>
                  `nav-link nav-link-3 ${isActive ? "active" : ""}`
                }
              >
                Modelo
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                to="/about"
                className={({ isActive }) =>
                  `nav-link nav-link-4 ${isActive ? "active" : ""}`
                }
              >
                Acerca de
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                to="/contact"
                className={({ isActive }) =>
                  `nav-link nav-link-5 ${isActive ? "active" : ""}`
                }
              >
                Contacto
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
