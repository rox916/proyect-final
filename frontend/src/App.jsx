import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import DataCollection from './pages/DataCollection'
import MLTraining from './pages/MLTraining'
import Prediction from './pages/Prediction'
import PredictionInterface from './pages/PredictionInterface'
import Analytics from './pages/Analytics'
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
          <Route
            path="/analytics"
            element={
              <PrivateRoute>
                <Analytics />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App
