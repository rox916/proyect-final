import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import DataCollection from './pages/DataCollection'
import MLTraining from './pages/MLTraining'
import Prediction from './pages/Prediction'
import PredictionInterface from './pages/PredictionInterface'  // 👈 NUEVO
import Analytics from './pages/Analytics'
import './index.css'

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/data-collection" element={<DataCollection />} />
          <Route path="/ml-training" element={<MLTraining />} />
          <Route path="/prediction" element={<Prediction />} />
          <Route path="/prediction/:model" element={<PredictionInterface />} /> {/* 👈 NUEVO */}
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
