import { useRef, useState } from "react";

function Camera() {
  const videoRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  let stream = null;

  const startCamera = async () => {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsActive(true);
      }
    } catch (err) {
      console.error("Error al acceder a la cámara:", err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setIsActive(false);
    }
  };

  return (
    <div className="container text-center mt-4">
      <h2>Cámara en tiempo real</h2>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{ width: "100%", maxWidth: "600px", borderRadius: "10px" }}
      ></video>

      <div className="mt-3">
        {!isActive ? (
          <button className="btn btn-success me-2" onClick={startCamera}>
            Encender cámara
          </button>
        ) : (
          <button className="btn btn-danger" onClick={stopCamera}>
            Apagar cámara
          </button>
        )}
      </div>
    </div>
  );
}

export default Camera;
