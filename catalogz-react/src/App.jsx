import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Loader from "./components/Loader";

// Pages
import Home from "./pages/Home";
import Contact from "./pages/Contact";
import Training from "./pages/Training";
import Modelo from "./pages/Modelo";
import About from "./pages/About";
import Vocales from "./pages/Vocales";
import Algoritmos from "./pages/Algoritmos";

function App() {
  return (
    <BrowserRouter>
      <Loader />
      <Navbar />
      <Routes>
        {/* Página principal */}
        <Route path="/" element={<Home />} />  

        {/* Otras páginas */}
        <Route path="/vocales" element={<Vocales />} />
        <Route path="/algoritmos" element={<Algoritmos />} />  
        <Route path="/training" element={<Training />} />  
        <Route path="/modelo" element={<Modelo />} />       
        <Route path="/about" element={<About />} /> 
        <Route path="/contact" element={<Contact />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
