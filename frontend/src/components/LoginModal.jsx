// LoginModal.jsx
import React, { useState } from "react";

const LoginModal = ({ show, onClose, onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Usuario hardcodeado
    const USER = { email: "admin@handspeak.ai", password: "123456" };

    if (email === USER.email && password === USER.password) {
      localStorage.setItem("isAuthenticated", "true"); // 🔹 Guardar login
      onLogin(); // avisar al padre
      onClose();
    } else {
      setError("Credenciales incorrectas");
    }
  };

  if (!show) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      role="dialog"
      style={{ background: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content p-4">
          <h5 className="modal-title mb-3">Iniciar Sesión</h5>
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Correo</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Contraseña</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100">
              Ingresar
            </button>
          </form>
          <button onClick={onClose} className="btn btn-link mt-3 w-100">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
