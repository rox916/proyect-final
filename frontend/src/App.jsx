import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import DataCollection from './pages/DataCollection'
import MLTraining from './pages/MLTraining'
import Prediction from './pages/Prediction'
import PredictionInterface from './pages/PredictionInterface'
import CalculadoraGestos from './pages/CalculadoraGestos'
import PrivateRoute from './components/PrivateRoute' // 👈 lo añadimos
import './index.css'

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/prediction" element={<Prediction />} />
          <Route path="/prediction/:model" element={<PredictionInterface />} />
          <Route path="/calculadora" element={<CalculadoraGestos />} />

          {/* Rutas protegidas */}
          <Route
            path="/data-collection"
            element={
              <PrivateRoute>
                <DataCollection />
              </PrivateRoute>
            }
          />
          <Route
            path="/ml-training"
            element={
              <PrivateRoute>
                <MLTraining />
              </PrivateRoute>
            }
          />
          
          {/* Redirección para rutas eliminadas */}
          <Route path="/analytics" element={<Navigate to="/" replace />} />
          
          {/* Ruta catch-all para rutas no encontradas */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
