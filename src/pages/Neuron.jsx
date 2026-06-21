import React, { useState, useEffect } from 'react';
import '../styles/neuron.css';

const neuronParts = {
  dendrites: {
    name: 'Dendrites',
    icon: '🌿',
    tag: 'Input Receivers',
    tagColor: '#10b981',
    tagBg: 'rgba(16,185,129,0.1)',
    iconBg: 'rgba(16,185,129,0.12)',
    description: 'Dendrites are tree-like branching extensions that receive electrical signals (impulses) from other neurons. A single neuron can have thousands of dendrites, each forming connections called synapses with other neurons. They act as the "antenna" of the neuron, collecting information from the surrounding neural network.',
    analogy: 'In artificial neural networks, dendrites correspond to the <strong>input connections</strong> — the incoming data features (x₁, x₂, ..., xₙ) that feed into a neuron. Just as biological dendrites collect signals from many sources, an artificial neuron receives multiple input values.',
    math: null
  },
  soma: {
    name: 'Cell Body (Soma)',
    icon: '🔵',
    tag: 'Processing Center',
    tagColor: '#3b82f6',
    tagBg: 'rgba(59,130,246,0.1)',
    iconBg: 'rgba(59,130,246,0.12)',
    description: 'The soma (cell body) is the central hub of the neuron. It contains the nucleus and is responsible for integrating (summing up) all the incoming signals from the dendrites. If the combined signal exceeds a certain threshold, the neuron "fires" — sending a signal down the axon.',
    analogy: 'This maps directly to the <strong>weighted sum</strong> operation in an artificial neuron: z = Σ(wᵢ·xᵢ) + b. The soma aggregates inputs just as the artificial neuron computes a weighted combination of all its inputs plus a bias term.',
    math: 'z = w₁x₁ + w₂x₂ + ... + wₙxₙ + b'
  },
  nucleus: {
    name: 'Nucleus',
    icon: '🧬',
    tag: 'Control Center',
    tagColor: '#8b5cf6',
    tagBg: 'rgba(139,92,246,0.1)',
    iconBg: 'rgba(139,92,246,0.12)',
    description: 'The nucleus contains the cell\'s DNA and controls the neuron\'s growth, maintenance, and protein synthesis. It acts as the "brain within the brain cell," directing all cellular activities and ensuring the neuron functions correctly over its lifetime.',
    analogy: 'The nucleus loosely maps to the <strong>learning algorithm / optimizer</strong> (e.g., SGD, Adam) in neural networks — the mechanism that governs how the network updates and maintains itself during training. It\'s the "meta-controller" that shapes the neuron\'s behavior over time.',
    math: null
  },
  axon: {
    name: 'Axon',
    icon: '⚡',
    tag: 'Signal Highway',
    tagColor: '#f59e0b',
    tagBg: 'rgba(245,158,11,0.1)',
    iconBg: 'rgba(245,158,11,0.12)',
    description: 'The axon is a long, slender projection that carries electrical impulses (action potentials) away from the cell body toward other neurons. Axons can be very short or stretch up to 1 meter long (e.g., from your spine to your toes). The signal travels in one direction only.',
    analogy: 'The axon corresponds to the <strong>output value</strong> of an artificial neuron after the activation function is applied: a = f(z). It represents the single output signal that gets transmitted to the next layer of neurons in the network.',
    math: 'output = f(z) = f(Σwᵢxᵢ + b)'
  },
  myelin: {
    name: 'Myelin Sheath',
    icon: '🛡️',
    tag: 'Signal Accelerator',
    tagColor: '#14b8a6',
    tagBg: 'rgba(20,184,166,0.1)',
    iconBg: 'rgba(20,184,166,0.12)',
    description: 'The myelin sheath is a fatty, insulating layer that wraps around the axon in segments. It dramatically speeds up signal transmission (up to 100x faster) by allowing electrical impulses to "jump" between gaps called Nodes of Ranvier. This is called saltatory conduction.',
    analogy: 'Myelin is analogous to <strong>Batch Normalization</strong> or <strong>skip connections</strong> in deep networks — techniques that speed up signal propagation and training. Just as myelin prevents signal degradation over long distances, these techniques prevent vanishing gradients in deep architectures.',
    math: null
  },
  terminals: {
    name: 'Axon Terminals (Synapses)',
    icon: '🔗',
    tag: 'Output Connectors',
    tagColor: '#ec4899',
    tagBg: 'rgba(236,72,153,0.1)',
    iconBg: 'rgba(236,72,153,0.12)',
    description: 'Axon terminals are the branching endpoints of the axon that form synapses with other neurons\' dendrites. At the synapse, electrical signals are converted to chemical signals (neurotransmitters) that cross the synaptic gap to stimulate or inhibit the next neuron.',
    analogy: 'Synapses correspond to the <strong>weights (parameters)</strong> connecting one layer to the next. The strength of a synapse (how much neurotransmitter is released) is equivalent to the weight value — both determine how strongly one neuron influences another.',
    math: 'next_input = weight × output'
  }
};

const networkParts = {
  inputLayer: {
    name: 'Input Layer',
    icon: '📥',
    tag: 'Data Entry',
    tagColor: '#10b981',
    tagBg: 'rgba(16,185,129,0.1)',
    iconBg: 'rgba(16,185,129,0.12)',
    description: 'The input layer is the first layer of a neural network. Each node represents one feature of the input data. For example, in image recognition, each pixel value is an input node. The input layer does not perform any computation — it simply passes data to the next layer.',
    analogy: 'Equivalent to the <strong>dendrites</strong> of a biological neuron — the entry points where external stimuli (data) enter the network. Just as dendrites receive signals from sensory organs, input nodes receive raw data from the outside world.',
    math: 'X = [x₁, x₂, x₃, ..., xₙ]'
  },
  weights: {
    name: 'Weights & Connections',
    icon: '⚖️',
    tag: 'Learnable Parameters',
    tagColor: '#f59e0b',
    tagBg: 'rgba(245,158,11,0.1)',
    iconBg: 'rgba(245,158,11,0.12)',
    description: 'Weights are the learnable parameters on each connection between neurons. They determine how much influence one neuron\'s output has on the next neuron\'s input. During training, weights are adjusted via backpropagation to minimize the prediction error. The magnitude and sign of a weight encode learned knowledge.',
    analogy: 'Directly equivalent to <strong>synaptic strength</strong> in biological neurons. Stronger synapses (more neurotransmitter release) = higher weight values. Learning in the brain strengthens useful synapses and weakens unused ones — just like weight updates in training.',
    math: 'z = w₁x₁ + w₂x₂ + w₃x₃ + b'
  },
  hiddenLayer: {
    name: 'Hidden Layer(s)',
    icon: '🔮',
    tag: 'Feature Extraction',
    tagColor: '#8b5cf6',
    tagBg: 'rgba(139,92,246,0.1)',
    iconBg: 'rgba(139,92,246,0.12)',
    description: 'Hidden layers sit between input and output. Each hidden neuron computes a weighted sum of its inputs, adds a bias, then applies an activation function. Deeper networks (more hidden layers) can learn increasingly abstract and complex representations — from edges to shapes to objects to concepts.',
    analogy: 'Analogous to <strong>interneurons</strong> in the brain — neurons that form complex circuits processing information between sensory input and motor output. The brain\'s cortex has multiple layers of these processing neurons, similar to deep network architectures.',
    math: 'h = f(W·x + b)'
  },
  activation: {
    name: 'Activation Function',
    icon: '⚡',
    tag: 'Non-linear Transform',
    tagColor: '#00d4ff',
    tagBg: 'rgba(0,212,255,0.1)',
    iconBg: 'rgba(0,212,255,0.12)',
    description: 'The activation function introduces non-linearity into the network, enabling it to learn complex patterns beyond simple linear relationships. Without it, stacking multiple layers would collapse to a single linear transformation. Common choices include ReLU, GELU, Sigmoid, and Swish.',
    analogy: 'Corresponds to the <strong>axon hillock / threshold mechanism</strong> in biological neurons. A biological neuron only fires (produces an action potential) when the combined input exceeds a threshold — this all-or-nothing response is the biological equivalent of an activation function.',
    math: 'a = f(z) → e.g., ReLU: max(0, z)'
  },
  bias: {
    name: 'Bias',
    icon: '🎯',
    tag: 'Offset Parameter',
    tagColor: '#ec4899',
    tagBg: 'rgba(236,72,153,0.1)',
    iconBg: 'rgba(236,72,153,0.12)',
    description: 'Bias is an additional learnable parameter added to the weighted sum before the activation function. It allows the neuron to shift the activation function left or right, giving it more flexibility. Without bias, the activation function would always pass through the origin.',
    analogy: 'Similar to the <strong>resting membrane potential</strong> in biological neurons — the baseline electrical charge that exists even without input. This resting potential determines how easily a neuron can be triggered to fire, just as bias shifts the activation threshold.',
    math: 'z = Σ(w\u1d62\u00b7x\u1d62) + b  \u2190 b is bias'
  },
  outputLayer: {
    name: 'Output Layer',
    icon: '📤',
    tag: 'Prediction',
    tagColor: '#ef4444',
    tagBg: 'rgba(239,68,68,0.1)',
    iconBg: 'rgba(239,68,68,0.12)',
    description: 'The output layer produces the final prediction or result. Its structure depends on the task: a single node for regression, multiple nodes with softmax for classification, or sigmoid nodes for multi-label problems. The output layer transforms the hidden representation into the desired format.',
    analogy: 'Equivalent to the <strong>axon terminals / motor output</strong> of biological neural circuits — the final signal that triggers an action (muscle movement, hormone release, etc.). The brain\'s output neurons translate processed information into concrete responses.',
    math: '\u0177 = softmax(W\u00b7h + b)'
  }
};

const differences = [
  {
    icon: '⚡',
    title: 'Signal Type',
    bio: 'Discrete binary electrical spikes (Action Potentials) occurring over time.',
    ai: 'Continuous floating-point values computed statically in layers.'
  },
  {
    icon: '🎓',
    title: 'Learning Mechanism',
    bio: 'Hebbian learning, neuroplasticity, localized chemical changes over time.',
    ai: 'Global optimization via Backpropagation and Gradient Descent.'
  },
  {
    icon: '🕸️',
    title: 'Topology',
    bio: 'Highly complex, recurrent, asynchronous, 3D spatial connections.',
    ai: 'Rigid layers, mostly feed-forward, synchronized, abstract graphs.'
  },
  {
    icon: '⏱️',
    title: 'Speed & Efficiency',
    bio: 'Slow signals (~100m/s) but massively parallel. Runs on ~20 Watts.',
    ai: 'Fast signals (speed of light) but relies on heavy GPU computation. High power use.'
  }
];

export default function Neuron() {
  const [selectedNeuron, setSelectedNeuron] = useState(null);
  const [selectedNetwork, setSelectedNetwork] = useState(null);

  // Scroll reveal logic
  useEffect(() => {
    const sections = document.querySelectorAll('.reveal-section');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    sections.forEach(s => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="page-body">
      {/* Hero Section */}
      <header className="neuron-hero">
        <div className="hero-content">
          <h1 className="section-title">The <span className="gradient-text">Neuron</span> Connection</h1>
          <p className="section-subtitle">How billions of years of biological evolution inspired the fundamental building blocks of modern Artificial Intelligence.</p>
        </div>
      </header>

      {/* 1. The Biological Neuron */}
      <section className="page-section reveal-section">
        <div className="section-header">
          <span className="section-number">1</span>
          <h2 className="section-title">The Biological Neuron</h2>
          <p className="section-subtitle">The fundamental unit of the human brain. Click on the highlighted parts of the neuron below to discover their functions and AI equivalents.</p>
        </div>

        <div className="diagram-wrapper">
          {/* SVG Diagram Container */}
          <div className="diagram-container">
            <div className="diagram-hint">
              <span>👆</span> Click on different parts to explore
            </div>
            
            <svg id="neuronSvg" className="neuron-svg" viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="axonGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.3" />
                </linearGradient>
              </defs>

              {/* Dendrites */}
              <g 
                className={`part-group part-pulse ${selectedNeuron === 'dendrites' ? 'active' : ''}`} 
                onClick={() => setSelectedNeuron('dendrites')}
                style={{ color: '#10b981' }}
              >
                <path d="M180,180 Q140,120 100,100 M180,220 Q140,280 100,300 M160,200 Q100,200 60,200 M190,160 Q160,80 180,40 M190,240 Q160,320 180,360" stroke="#10b981" strokeWidth="8" strokeLinecap="round" fill="none" />
                <circle cx="100" cy="100" r="12" fill="#10b981" />
                <circle cx="100" cy="300" r="12" fill="#10b981" />
                <circle cx="60" cy="200" r="12" fill="#10b981" />
                <circle cx="180" cy="40" r="12" fill="#10b981" />
                <circle cx="180" cy="360" r="12" fill="#10b981" />
              </g>

              {/* Soma */}
              <g 
                className={`part-group part-pulse ${selectedNeuron === 'soma' ? 'active' : ''}`}
                onClick={() => setSelectedNeuron('soma')}
                style={{ color: '#3b82f6' }}
              >
                <circle cx="220" cy="200" r="60" fill="#3b82f6" fillOpacity="0.2" stroke="#3b82f6" strokeWidth="4" />
              </g>

              {/* Nucleus */}
              <g 
                className={`part-group part-pulse ${selectedNeuron === 'nucleus' ? 'active' : ''}`}
                onClick={() => setSelectedNeuron('nucleus')}
                style={{ color: '#8b5cf6' }}
              >
                <circle cx="220" cy="200" r="25" fill="#8b5cf6" />
              </g>

              {/* Axon */}
              <g 
                className={`part-group part-pulse ${selectedNeuron === 'axon' ? 'active' : ''}`}
                onClick={() => setSelectedNeuron('axon')}
                style={{ color: '#f59e0b' }}
              >
                <path d="M280,200 L600,200" stroke="url(#axonGradient)" strokeWidth="12" strokeLinecap="round" fill="none" />
              </g>

              {/* Myelin Sheath */}
              <g 
                className={`part-group part-pulse ${selectedNeuron === 'myelin' ? 'active' : ''}`}
                onClick={() => setSelectedNeuron('myelin')}
                style={{ color: '#14b8a6' }}
              >
                <rect x="300" y="185" width="40" height="30" rx="8" fill="#14b8a6" />
                <rect x="360" y="185" width="40" height="30" rx="8" fill="#14b8a6" />
                <rect x="420" y="185" width="40" height="30" rx="8" fill="#14b8a6" />
                <rect x="480" y="185" width="40" height="30" rx="8" fill="#14b8a6" />
                <rect x="540" y="185" width="40" height="30" rx="8" fill="#14b8a6" />
              </g>

              {/* Axon Terminals */}
              <g 
                className={`part-group part-pulse ${selectedNeuron === 'terminals' ? 'active' : ''}`}
                onClick={() => setSelectedNeuron('terminals')}
                style={{ color: '#ec4899' }}
              >
                <path d="M600,200 Q640,160 680,140 M600,200 Q640,240 680,260 M600,200 Q650,200 700,200" stroke="#ec4899" strokeWidth="6" strokeLinecap="round" fill="none" />
                <circle cx="680" cy="140" r="10" fill="#ec4899" />
                <circle cx="680" cy="260" r="10" fill="#ec4899" />
                <circle cx="700" cy="200" r="10" fill="#ec4899" />
              </g>
            </svg>
          </div>

          {/* Detail Panel */}
          <div className="detail-panel" id="neuronDetail">
            {!selectedNeuron ? (
              <div className="detail-panel-empty">
                <div className="empty-icon">🧠</div>
                <p>Select a part of the biological neuron to see how it works and how it translates to artificial neural networks.</p>
              </div>
            ) : (
              <div className="detail-panel-content visible">
                <div className="detail-header">
                  <div className="detail-icon-row">
                    <div className="detail-icon" style={{ background: neuronParts[selectedNeuron].iconBg }}>
                      {neuronParts[selectedNeuron].icon}
                    </div>
                    <div>
                      <h3 className="detail-name">{neuronParts[selectedNeuron].name}</h3>
                      <span className="detail-tag" style={{ color: neuronParts[selectedNeuron].tagColor, background: neuronParts[selectedNeuron].tagBg }}>
                        {neuronParts[selectedNeuron].tag}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="detail-body">
                  <p className="detail-description">{neuronParts[selectedNeuron].description}</p>
                  <div className="detail-analogy">
                    <div className="detail-analogy-label">🤖 AI Equivalent</div>
                    <div className="detail-analogy-text" dangerouslySetInnerHTML={{ __html: neuronParts[selectedNeuron].analogy }}></div>
                    {neuronParts[selectedNeuron].math && (
                      <div className="detail-math">{neuronParts[selectedNeuron].math}</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. The Artificial Neural Network */}
      <section className="page-section reveal-section">
        <div className="section-header">
          <span className="section-number">2</span>
          <h2 className="section-title">The Artificial Network</h2>
          <p className="section-subtitle">How biological inspiration is structured in code. Explore the components of a simple deep learning network.</p>
        </div>

        <div className="diagram-wrapper reverse">
          {/* Detail Panel (Left side) */}
          <div className="detail-panel" id="networkDetail">
            {!selectedNetwork ? (
              <div className="detail-panel-empty">
                <div className="empty-icon">🤖</div>
                <p>Select a component of the artificial neural network to learn about its role in deep learning.</p>
              </div>
            ) : (
              <div className="detail-panel-content visible">
                <div className="detail-header">
                  <div className="detail-icon-row">
                    <div className="detail-icon" style={{ background: networkParts[selectedNetwork].iconBg }}>
                      {networkParts[selectedNetwork].icon}
                    </div>
                    <div>
                      <h3 className="detail-name">{networkParts[selectedNetwork].name}</h3>
                      <span className="detail-tag" style={{ color: networkParts[selectedNetwork].tagColor, background: networkParts[selectedNetwork].tagBg }}>
                        {networkParts[selectedNetwork].tag}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="detail-body">
                  <p className="detail-description">{networkParts[selectedNetwork].description}</p>
                  <div className="detail-analogy">
                    <div className="detail-analogy-label">🧠 Biological Equivalent</div>
                    <div className="detail-analogy-text" dangerouslySetInnerHTML={{ __html: networkParts[selectedNetwork].analogy }}></div>
                    {networkParts[selectedNetwork].math && (
                      <div className="detail-math">{networkParts[selectedNetwork].math}</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SVG Diagram Container */}
          <div className="diagram-container">
            <div className="diagram-hint">
              <span>👆</span> Click on different layers to explore
            </div>
            
            <svg id="networkSvg" className="network-svg" viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg">
              {/* Connections / Weights */}
              <g 
                className={`part-group ${selectedNetwork === 'weights' ? 'active' : ''}`}
                onClick={() => setSelectedNetwork('weights')}
                style={{ color: '#f59e0b' }}
              >
                {/* Input to Hidden 1 */}
                <path d="M120,150 L300,100 M120,150 L300,250 M120,150 L300,400" stroke="#f59e0b" strokeWidth="2" strokeOpacity="0.3" fill="none" />
                <path d="M120,250 L300,100 M120,250 L300,250 M120,250 L300,400" stroke="#f59e0b" strokeWidth="2" strokeOpacity="0.3" fill="none" />
                <path d="M120,350 L300,100 M120,350 L300,250 M120,350 L300,400" stroke="#f59e0b" strokeWidth="2" strokeOpacity="0.3" fill="none" />
                {/* Hidden 1 to Hidden 2 */}
                <path d="M300,100 L480,100 M300,100 L480,250 M300,100 L480,400" stroke="#f59e0b" strokeWidth="2" strokeOpacity="0.3" fill="none" />
                <path d="M300,250 L480,100 M300,250 L480,250 M300,250 L480,400" stroke="#f59e0b" strokeWidth="2" strokeOpacity="0.3" fill="none" />
                <path d="M300,400 L480,100 M300,400 L480,250 M300,400 L480,400" stroke="#f59e0b" strokeWidth="2" strokeOpacity="0.3" fill="none" />
                {/* Hidden 2 to Output */}
                <path d="M480,100 L680,200 M480,100 L680,300" stroke="#f59e0b" strokeWidth="2" strokeOpacity="0.3" fill="none" />
                <path d="M480,250 L680,200 M480,250 L680,300" stroke="#f59e0b" strokeWidth="2" strokeOpacity="0.3" fill="none" />
                <path d="M480,400 L680,200 M480,400 L680,300" stroke="#f59e0b" strokeWidth="2" strokeOpacity="0.3" fill="none" />
              </g>

              {/* Input Layer */}
              <g 
                className={`part-group part-pulse ${selectedNetwork === 'inputLayer' ? 'active' : ''}`}
                onClick={() => setSelectedNetwork('inputLayer')}
                style={{ color: '#10b981' }}
              >
                <circle cx="120" cy="150" r="24" fill="#10b981" fillOpacity="0.2" stroke="#10b981" strokeWidth="3" />
                <circle cx="120" cy="250" r="24" fill="#10b981" fillOpacity="0.2" stroke="#10b981" strokeWidth="3" />
                <circle cx="120" cy="350" r="24" fill="#10b981" fillOpacity="0.2" stroke="#10b981" strokeWidth="3" />
                <text x="120" y="420" fill="#10b981" fontSize="14" fontFamily="Inter" textAnchor="middle" fontWeight="600">Input</text>
              </g>

              {/* Hidden Layers */}
              <g 
                className={`part-group part-pulse ${selectedNetwork === 'hiddenLayer' ? 'active' : ''}`}
                onClick={() => setSelectedNetwork('hiddenLayer')}
                style={{ color: '#8b5cf6' }}
              >
                {/* Layer 1 */}
                <circle cx="300" cy="100" r="28" fill="#8b5cf6" fillOpacity="0.2" stroke="#8b5cf6" strokeWidth="3" />
                <circle cx="300" cy="250" r="28" fill="#8b5cf6" fillOpacity="0.2" stroke="#8b5cf6" strokeWidth="3" />
                <circle cx="300" cy="400" r="28" fill="#8b5cf6" fillOpacity="0.2" stroke="#8b5cf6" strokeWidth="3" />
                {/* Layer 2 */}
                <circle cx="480" cy="100" r="28" fill="#8b5cf6" fillOpacity="0.2" stroke="#8b5cf6" strokeWidth="3" />
                <circle cx="480" cy="250" r="28" fill="#8b5cf6" fillOpacity="0.2" stroke="#8b5cf6" strokeWidth="3" />
                <circle cx="480" cy="400" r="28" fill="#8b5cf6" fillOpacity="0.2" stroke="#8b5cf6" strokeWidth="3" />
                <text x="390" y="470" fill="#8b5cf6" fontSize="14" fontFamily="Inter" textAnchor="middle" fontWeight="600">Hidden Layers</text>
              </g>

              {/* Activation Functions */}
              <g 
                className={`part-group part-pulse ${selectedNetwork === 'activation' ? 'active' : ''}`}
                onClick={() => setSelectedNetwork('activation')}
                style={{ color: '#00d4ff' }}
              >
                <path d="M290,105 L300,105 L305,95 L310,95" stroke="#00d4ff" strokeWidth="3" fill="none" />
                <path d="M290,255 L300,255 L305,245 L310,245" stroke="#00d4ff" strokeWidth="3" fill="none" />
                <path d="M290,405 L300,405 L305,395 L310,395" stroke="#00d4ff" strokeWidth="3" fill="none" />
                
                <path d="M470,105 L480,105 L485,95 L490,95" stroke="#00d4ff" strokeWidth="3" fill="none" />
                <path d="M470,255 L480,255 L485,245 L490,245" stroke="#00d4ff" strokeWidth="3" fill="none" />
                <path d="M470,405 L480,405 L485,395 L490,395" stroke="#00d4ff" strokeWidth="3" fill="none" />
              </g>

              {/* Biases */}
              <g 
                className={`part-group part-pulse ${selectedNetwork === 'bias' ? 'active' : ''}`}
                onClick={() => setSelectedNetwork('bias')}
                style={{ color: '#ec4899' }}
              >
                <circle cx="300" cy="70" r="8" fill="#ec4899" />
                <circle cx="300" cy="220" r="8" fill="#ec4899" />
                <circle cx="300" cy="370" r="8" fill="#ec4899" />
                
                <circle cx="480" cy="70" r="8" fill="#ec4899" />
                <circle cx="480" cy="220" r="8" fill="#ec4899" />
                <circle cx="480" cy="370" r="8" fill="#ec4899" />
              </g>

              {/* Output Layer */}
              <g 
                className={`part-group part-pulse ${selectedNetwork === 'outputLayer' ? 'active' : ''}`}
                onClick={() => setSelectedNetwork('outputLayer')}
                style={{ color: '#ef4444' }}
              >
                <circle cx="680" cy="200" r="32" fill="#ef4444" fillOpacity="0.2" stroke="#ef4444" strokeWidth="3" />
                <circle cx="680" cy="300" r="32" fill="#ef4444" fillOpacity="0.2" stroke="#ef4444" strokeWidth="3" />
                <text x="680" y="370" fill="#ef4444" fontSize="14" fontFamily="Inter" textAnchor="middle" fontWeight="600">Output</text>
              </g>
            </svg>
          </div>
        </div>
      </section>

      {/* 3. Key Differences */}
      <section className="page-section reveal-section">
        <div className="section-header">
          <h2 className="section-title">Bridging the Gap</h2>
          <p className="section-subtitle">While inspired by biology, artificial neural networks simplify and abstract many complex biological processes.</p>
        </div>

        <div className="differences-grid">
          {differences.map((diff, index) => (
            <div className="diff-card" key={index}>
              <div className="diff-card-icon">{diff.icon}</div>
              <h3 className="diff-card-title">{diff.title}</h3>
              <div className="diff-label bio">Biological</div>
              <div className="diff-card-bio">{diff.bio}</div>
              <div className="diff-label ai">Artificial</div>
              <div className="diff-card-ai">{diff.ai}</div>
            </div>
          ))}
        </div>

        <div className="facts-grid">
          <div className="fact-card">
            <div className="fact-icon">💡</div>
            <div className="fact-text">
              <strong>Fun Fact:</strong> The human brain contains roughly <strong>86 billion neurons</strong> and over <strong>100 trillion synapses</strong> (connections). State-of-the-art AI models like GPT-4 have over 1 trillion parameters, approaching the raw scale of the brain, though functioning differently.
            </div>
          </div>
          <div className="fact-card">
            <div className="fact-icon">🔄</div>
            <div className="fact-text">
              <strong>Activation Functions:</strong> The biological equivalent of an activation function is the <strong>Action Potential Threshold</strong>. A biological neuron doesn't fire strongly or weakly — it fires completely or not at all, closer to a Step Function than a modern continuous ReLU.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
