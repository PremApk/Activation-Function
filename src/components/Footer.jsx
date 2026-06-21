import React from 'react';

export default function Footer({ text, subText }) {
  const defaultText = "🧠 Activation Functions Explorer — An interactive learning tool for understanding neural network internals.";
  const defaultSub = "Built for curious minds exploring the building blocks of modern AI.";

  return (
    <footer className="footer">
      <div className="footer-content">
        <p className="footer-text">{text || defaultText}</p>
        <p className="footer-sub">{subText || defaultSub}</p>
      </div>
    </footer>
  );
}
