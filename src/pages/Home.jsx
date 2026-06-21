import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/home.css';

export default function Home() {
  return (
    <main className="hero-container">
      <div className="title-badge">
        <span className="dot"></span>
        <span>Deep Learning Interactive Guide</span>
      </div>

      <h1 className="main-title">
        Deep Learning <br />
        <span className="gradient-text">Visualization</span> & Learning
      </h1>

      <p className="subtitle">
        An interactive, visual journey through the fundamental building blocks of modern Artificial Intelligence. Understand the math, the biology, and the code.
      </p>

      {/* Navigation Cards */}
      <div className="nav-grid">
        <Link to="/ai-concepts" className="nav-card">
          <div className="card-icon">📚</div>
          <h2 className="card-title">AI Concepts</h2>
          <p className="card-desc">
            Understand the hierarchy of AI: Machine Learning, Deep Learning, Gen AI, and LLMs with real-world examples.
          </p>
        </Link>

        <Link to="/activations" className="nav-card">
          <div className="card-icon">📈</div>
          <h2 className="card-title">Activation Functions</h2>
          <p className="card-desc">
            Explore 17+ activation functions with real-time graphs, sliders, mathematical formulas, and use cases.
          </p>
        </Link>

        <Link to="/neuron" className="nav-card">
          <div className="card-icon">🧠</div>
          <h2 className="card-title">The Neuron Connection</h2>
          <p className="card-desc">
            Discover how billions of years of biological evolution inspired the artificial neural networks of today.
          </p>
        </Link>

        <Link to="/parameters" className="nav-card">
          <div className="card-icon">🧮</div>
          <h2 className="card-title">Parameter Visualizer</h2>
          <p className="card-desc">
            Enter any parameter count to instantly visualize the scale and structure of a corresponding neural network.
          </p>
        </Link>
      </div>
    </main>
  );
}
