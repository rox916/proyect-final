import Camera from "../components/Camera";

function Vocales() {
  return (
    <div className="container mt-4">
      <h1>Predicción de Vocales</h1>
      <p>
        Usa la cámara en tiempo real para reconocer las señas correspondientes a
        las vocales.
      </p>
      <Camera />
    </div>
  );
}

export default Vocales;
