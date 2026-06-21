import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="site-nav">
      <NavLink to="/" className="nav-brand">
        <span className="nav-brand-icon">🧠</span>
        <span className="nav-brand-text">Activation<span className="gradient-text">Explorer</span></span>
      </NavLink>
      <div className="nav-links">
        <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
          <span className="nav-link-icon">🏠</span>
          <span>Home</span>
        </NavLink>
        <NavLink to="/ai-concepts" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <span className="nav-link-icon">📚</span>
          <span>AI Concepts</span>
        </NavLink>
        <NavLink to="/activations" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <span className="nav-link-icon">📊</span>
          <span>Functions</span>
        </NavLink>
        <NavLink to="/neuron" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <span className="nav-link-icon">🧬</span>
          <span>The Neuron</span>
        </NavLink>
        <NavLink to="/parameters" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <span className="nav-link-icon">🧮</span>
          <span>Parameters</span>
        </NavLink>
      </div>
    </nav>
  );
}
