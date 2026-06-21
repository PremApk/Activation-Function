import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import BackgroundOrbs from './components/BackgroundOrbs';
import Footer from './components/Footer';

import Home from './pages/Home';
import AiConcepts from './pages/AiConcepts';
import Activations from './pages/Activations';
import Neuron from './pages/Neuron';
import Parameters from './pages/Parameters';

function App() {
  return (
    <Router>
      <BackgroundOrbs />
      <Navbar />
      <div className="app-content-wrapper">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ai-concepts" element={<AiConcepts />} />
          <Route path="/activations" element={<Activations />} />
          <Route path="/neuron" element={<Neuron />} />
          <Route path="/parameters" element={<Parameters />} />
        </Routes>
      </div>
      <Footer />
    </Router>
  );
}

export default App;
