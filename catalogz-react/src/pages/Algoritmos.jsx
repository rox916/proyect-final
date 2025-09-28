import Camera from "../components/Camera";

function Algoritmos() {
  return (
    <div className="container mt-4">
      <h1>Predicción de Algoritmos</h1>
      <p>
        Usa la cámara en tiempo real para reconocer las señas correspondientes
        a la categoría <strong>Algoritmos</strong>.
      </p>
      <Camera />
    </div>
  );
}

export default Algoritmos;
