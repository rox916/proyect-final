// SuccessModal.jsx
import React, { useEffect } from "react";
import { FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";

const SuccessModal = ({ show, message, subMessage = "", onClose, icon = "check", color = "success", autoClose = true }) => {
  useEffect(() => {
    if (show && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, 2500); // se cierra automáticamente en 2.5s
      return () => clearTimeout(timer);
    }
  }, [show, autoClose, onClose]);

  if (!show) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      role="dialog"
      style={{ background: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content p-5 border-0 shadow-lg d-flex flex-column align-items-center text-center">
          {/* ✅ Ícono grande centrado */}
          {icon === "check" && <FaCheckCircle size={100} className={`text-${color} mb-3`} />}
          {icon === "warning" && <FaExclamationTriangle size={100} className={`text-${color} mb-3`} />}

          {/* Mensaje principal */}
          <h5 className="fw-bold text-dark">{message}</h5>

          {/* Sub-mensaje adicional */}
          {subMessage && <p className="text-muted mt-2">{subMessage}</p>}

          {/* Botones para confirmación (solo si autoClose=false) */}
          {!autoClose && (
            <div className="d-flex justify-content-center mt-4 gap-3">
              <button className="btn btn-secondary" onClick={() => onClose(false)}>
                Cancelar
              </button>
              <button className="btn btn-danger" onClick={() => onClose(true)}>
                Confirmar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
