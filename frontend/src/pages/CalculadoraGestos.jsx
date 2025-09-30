// CalculadoraGestos.jsx
import React, { useState, useEffect } from 'react';
import MediaPipeCamera from '../components/MediaPipeCamera';
import HeroNavbar from '../components/HeroNavbar';

const CalculadoraGestos = () => {
  // Estados de la calculadora
  const [display, setDisplay] = useState("0");
  const [currentNumber, setCurrentNumber] = useState("");
  const [operation, setOperation] = useState(null);
  const [waitingForNumber, setWaitingForNumber] = useState(true);
  const [mode, setMode] = useState("number"); // "number" | "operation"
  const [history, setHistory] = useState([]);
  
  // Estados de MediaPipe
  const [isHandDetected, setIsHandDetected] = useState(false);
  const [landmarks, setLandmarks] = useState(null);
  const [lastPredictionTime, setLastPredictionTime] = useState(0);
  const [isPredicting, setIsPredicting] = useState(false);
  const [lastPrediction, setLastPrediction] = useState(null);
  const [predictionConfidence, setPredictionConfidence] = useState(0);
  
  // Números del 0 al 9
  const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  
  // Operaciones disponibles
  const operations = [
    { symbol: '+', name: 'suma' },
    { symbol: '-', name: 'resta' },
    { symbol: '*', name: 'multiplicación' },
    { symbol: '/', name: 'división' },
    { symbol: '=', name: 'igual' },
    { symbol: 'C', name: 'limpiar' }
  ];

  // Detectar números por gestos
  useEffect(() => {
    const now = Date.now();
    
    // Si no se detecta la mano, limpiar la predicción
    if (!isHandDetected) {
      setLastPrediction(null);
      setPredictionConfidence(0);
      return;
    }
    
    if (!isPredicting || !landmarks || landmarks.length !== 21) return;
    
    if (now - lastPredictionTime < 1000) return; // Cooldown de 1 segundo
    
    setLastPredictionTime(now);
    predictNumber(landmarks);
  }, [landmarks, isHandDetected, isPredicting, lastPredictionTime]);

  const predictNumber = async (landmarks) => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/numeros/predict/1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(landmarks)
      });

      if (response.ok) {
        const result = await response.json();
        const predictedNumber = result.prediction;
        const confidence = result.confidence || 0;
        
        // Guardar información de la predicción
        setLastPrediction(predictedNumber);
        setPredictionConfidence(confidence);
        
        // Solo aceptar números con confianza moderada (más del 50%)
        if (numbers.includes(predictedNumber) && confidence > 0.5 && mode === "number") {
          console.log(`Número detectado: ${predictedNumber} (confianza: ${(confidence * 100).toFixed(1)}%)`);
          handleNumberInput(predictedNumber);
        } else if (confidence <= 0.5) {
          console.log(`Predicción rechazada: ${predictedNumber} (confianza baja: ${(confidence * 100).toFixed(1)}%)`);
        }
      }
    } catch (error) {
      console.error('Error en predicción:', error);
    }
  };

  const handleNumberInput = (number) => {
    // Si estamos esperando un nuevo número (después de una operación), empezar de cero
    if (waitingForNumber) {
      console.log(`Nuevo número después de operación: ${number}`);
      setCurrentNumber(number);
      setDisplay(display + " " + number);
      setWaitingForNumber(false);
    } else {
      // Si no estamos esperando un nuevo número, concatenar al número actual
      const newNumber = currentNumber + number;
      console.log(`Número detectado: ${number}, Número actual: ${currentNumber}, Nuevo número: ${newNumber}`);
      setCurrentNumber(newNumber);
      setDisplay(newNumber);
    }
  };

  const handleOperation = (op) => {
    if (op === 'C') {
      clearCalculator();
      return;
    }
    
    if (op === '=') {
      calculateResult();
      return;
    }
    
    if (currentNumber) {
      setOperation(op);
      setMode("number");
      setWaitingForNumber(true);
      // Guardar el número actual y la operación
      setDisplay(currentNumber + " " + op);
      setCurrentNumber(""); // Limpiar para el siguiente número
    }
  };

  const calculateResult = () => {
    if (!operation || !currentNumber) {
      console.log('No se puede calcular:', { operation, currentNumber });
      return;
    }
    
    try {
      // Extraer el primer número del display (antes de la operación)
      const displayParts = display.split(' ');
      const num1 = parseFloat(displayParts[0]);
      const num2 = parseFloat(currentNumber);
      
      console.log('Calculando:', { num1, operation, num2 });
      
      let result;
      
      switch (operation) {
        case '+':
          result = num1 + num2;
          break;
        case '-':
          result = num1 - num2;
          break;
        case '*':
          result = num1 * num2;
          break;
        case '/':
          result = num2 !== 0 ? num1 / num2 : 0;
          break;
        default:
          result = num2;
      }
      
      console.log('Resultado:', result);
      
      const expression = `${num1} ${operation} ${num2} = ${result}`;
      
      setHistory(prev => [...prev, {
        expression: expression,
        timestamp: new Date().toISOString()
      }]);
      
      setDisplay(result.toString());
      setCurrentNumber(result.toString()); // Guardar el resultado como el número actual
      setOperation(null);
      setWaitingForNumber(true);
      setMode("number");
    } catch (error) {
      console.error('Error en cálculo:', error);
      setDisplay("Error");
    }
  };

  const clearCalculator = () => {
    setDisplay("0");
    setCurrentNumber("");
    setOperation(null);
    setWaitingForNumber(true);
    setMode("number");
  };

  const startPrediction = () => {
    setIsPredicting(true);
  };

  const stopPrediction = () => {
    setIsPredicting(false);
  };

  return (
    <div>
      <HeroNavbar />
      <section className="container my-5">
        <h2 className="fw-bold text-center mb-4">
          🧮 Calculadora de Gestos
        </h2>

        <div className="row g-4">
          {/* Pantalla de la calculadora */}
          <div className="col-md-6">
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="calculator-display mb-4">
                  <div className="display-screen bg-dark text-light p-3 rounded text-end" style={{fontSize: '2rem', minHeight: '80px'}}>
                    {display}
                  </div>
                  <div className="status-indicator mt-2">
                    <span className={`badge ${mode === "number" ? "bg-success" : "bg-warning"}`}>
                      {mode === "number" ? "🤚 Esperando número..." : "➕ Selecciona operación"}
                    </span>
                  </div>
                </div>

                {/* Botones de operaciones */}
                <div className="operations-grid mb-4">
                  <h6 className="fw-bold mb-3">Operaciones:</h6>
                  <div className="row g-2">
                    {operations.map((op, index) => (
                      <div key={index} className="col-4">
                        <button
                          className={`btn w-100 ${op.symbol === 'C' ? 'btn-danger' : 'btn-primary'}`}
                          onClick={() => handleOperation(op.symbol)}
                        >
                          {op.symbol}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Controles */}
                <div className="controls">
                  <div className="d-grid gap-2">
                    {!isPredicting ? (
                      <button className="btn btn-success" onClick={startPrediction}>
                        🚀 Iniciar Detección
                      </button>
                    ) : (
                      <button className="btn btn-danger" onClick={stopPrediction}>
                        ⏹️ Detener Detección
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cámara y estado */}
          <div className="col-md-6">
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="fw-bold mb-3">Estado del Sistema</h5>
                
                <div className="status-info mb-3">
                  <p>
                    Mano: {isHandDetected ? (
                      <span className="text-success">✅ Detectada</span>
                    ) : (
                      <span className="text-danger">❌ No detectada</span>
                    )}
                  </p>
                  <p>
                    Modo: <span className="fw-bold">{mode === "number" ? "Números" : "Operaciones"}</span>
                  </p>
                  <p>
                    Estado: {isPredicting ? (
                      <span className="text-success">🔄 Detectando...</span>
                    ) : (
                      <span className="text-secondary">⏸️ Pausado</span>
                    )}
                  </p>
                  
                  {/* Indicador de predicción */}
                  {lastPrediction && (
                    <div className="prediction-info mt-3 p-2 bg-light rounded">
                      <p className="mb-1">
                        <strong>Última predicción:</strong> {lastPrediction}
                      </p>
                      <p className="mb-0">
                        <strong>Confianza:</strong> 
                        <span className={`ms-1 ${predictionConfidence > 0.5 ? 'text-success' : 'text-warning'}`}>
                          {(predictionConfidence * 100).toFixed(1)}%
                        </span>
                        {predictionConfidence <= 0.5 && (
                          <span className="text-muted ms-2">(Rechazada - muy baja)</span>
                        )}
                      </p>
                    </div>
                  )}
                </div>

                {isPredicting ? (
                  <MediaPipeCamera
                    onLandmarks={setLandmarks}
                    onHandDetected={setIsHandDetected}
                    dualHandMode={false}
                  />
                ) : (
                  <div className="text-center text-muted">
                    <p>Inicia la detección para usar la calculadora</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Historial de operaciones */}
        {history.length > 0 && (
          <div className="row mt-4">
            <div className="col-12">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="fw-bold mb-3">📊 Historial de Operaciones</h5>
                  <div className="history-list">
                    {history.slice(-5).reverse().map((item, index) => (
                      <div key={index} className="d-flex justify-content-between border-bottom py-2">
                        <span className="fw-bold">{item.expression}</span>
                        <span className="text-muted small">
                          {new Date(item.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default CalculadoraGestos;
