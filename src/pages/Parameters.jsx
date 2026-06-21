import React, { useState, useEffect, useRef } from 'react';
import '../styles/parameters.css';

// Preset configurations
const presets = [
  { value: 'custom', label: 'Custom (Enter below)' },
  { group: 'Small / Learning Architectures', items: [
    { value: '100,2', label: 'Tiny Toy Network (100 params)' },
    { value: '1000,2', label: 'Small Dense (1K params)' },
    { value: '10000,3', label: 'Medium Dense (10K params)' },
    { value: '60000,3', label: 'LeNet-5 Approx (60K params)' }
  ]},
  { group: 'Larger Architectures', items: [
    { value: '100000,4', label: 'Large Dense (100K params)' },
    { value: '500000,5', label: 'Sparse-like Base (500K params)' },
    { value: '1000000,6', label: 'Mega Network (1M params)' }
  ]}
];

// Helper to calculate parameters of architecture
function calculateParams(arch) {
  let p = 0;
  for (let i = 0; i < arch.length - 1; i++) {
    p += (arch[i] * arch[i + 1]) + arch[i + 1]; // weights + biases
  }
  return p;
}

// Approximation algorithm
function generateArchitecture(target, numHidden) {
  if (numHidden < 1) numHidden = 1;
  if (target < 2) return Array(numHidden + 2).fill(1); // Min possible network
  
  let bestArch = Array(numHidden + 2).fill(1);
  let minDiff = Infinity;
  
  let approxDim = Math.max(1, Math.sqrt(target / (numHidden + 1)));
  
  for (let step = 0; step < 5000; step++) {
    let arch = new Array(numHidden + 2);
    
    // Randomize all but the last layer (Output)
    arch[0] = Math.max(1, Math.floor(Math.random() * Math.min(100, approxDim * 1.5)) + 1);
    for (let i = 1; i <= numHidden; i++) {
      arch[i] = Math.max(1, Math.floor(Math.random() * approxDim * 2) + 1);
    }
    
    // Analytically compute ideal Output size
    let pPrev = 0;
    for (let i = 0; i < numHidden; i++) {
      pPrev += arch[i] * arch[i+1] + arch[i+1];
    }
    
    let hLast = arch[numHidden];
    let idealO = Math.max(1, Math.round((target - pPrev) / (hLast + 1)));
    arch[numHidden + 1] = idealO;
    
    let p = calculateParams(arch);
    let diff = Math.abs(p - target);
    
    if (diff < minDiff) { 
      minDiff = diff; 
      bestArch = [...arch]; 
    }
    if (diff === 0) break; 
  }
  
  return bestArch;
}

export default function Parameters() {
  const canvasRef = useRef(null);
  const [paramInput, setParamInput] = useState(100);
  const [hiddenInput, setHiddenInput] = useState(2);
  const [preset, setPreset] = useState('custom');
  const [loading, setLoading] = useState(false);

  // Current architecture details
  const [archData, setArchData] = useState({
    requested: 100,
    actual: 0,
    layers: [1, 1, 1], // default fallback
    inputNodes: 0,
    hiddenNodes: 0,
    outputNodes: 0
  });

  // Calculate and trigger draw
  const handleVisualize = () => {
    const target = parseInt(paramInput);
    const hidden = parseInt(hiddenInput);
    if (isNaN(target) || target < 1) return;

    setLoading(true);

    // Yield to let React render the loading spinner
    setTimeout(() => {
      const arch = generateArchitecture(target, isNaN(hidden) ? 2 : hidden);
      const actual = calculateParams(arch);
      
      let hiddenTotal = 0;
      for (let i = 1; i < arch.length - 1; i++) {
        hiddenTotal += arch[i];
      }

      const newData = {
        requested: target,
        actual: actual,
        layers: arch,
        inputNodes: arch[0],
        hiddenNodes: hiddenTotal,
        outputNodes: arch[arch.length - 1]
      };

      setArchData(newData);
      setLoading(false);
    }, 50);
  };

  // Preset Selection Handler
  const handlePresetChange = (e) => {
    const val = e.target.value;
    setPreset(val);
    if (val !== 'custom') {
      const [params, layers] = val.split(',');
      setParamInput(parseInt(params));
      setHiddenInput(parseInt(layers));
    }
  };

  // Draw loop
  const drawNetwork = (layers) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    const parent = canvas.parentElement;
    const dpr = window.devicePixelRatio || 1;
    const rect = parent.getBoundingClientRect();
    
    // Resize buffer
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    // Set style size
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const width = rect.width;
    const height = rect.height;

    // Background fill
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    const numLayers = layers.length;
    const paddingX = width * 0.1;
    const paddingY = height * 0.1;
    const usableWidth = width - (paddingX * 2);
    const usableHeight = height - (paddingY * 2);

    const layerSpacing = usableWidth / (numLayers - 1 || 1);

    // Visual Node coordinates
    const nodePositions = [];
    const maxNodes = Math.max(...layers);
    const VISUAL_MAX_NODES = 200; 
    const visualLayers = layers.map(n => Math.min(n, VISUAL_MAX_NODES));
    const maxVisualNodes = Math.max(...visualLayers);
    
    const nodeRadius = Math.max(1, Math.min(15, (usableHeight / maxVisualNodes) * 0.4));

    for (let i = 0; i < numLayers; i++) {
      const nodesInLayer = visualLayers[i];
      const layerPositions = [];
      
      const x = paddingX + (i * layerSpacing);
      const nodeSpacing = nodesInLayer > 1 ? usableHeight / (nodesInLayer - 1) : 0;
      const startY = nodesInLayer > 1 ? paddingY : height / 2;

      for (let j = 0; j < nodesInLayer; j++) {
        const y = startY + (j * nodeSpacing);
        layerPositions.push({ x, y });
      }
      nodePositions.push(layerPositions);
    }

    // Connections (Weights)
    ctx.beginPath();
    const MAX_LINES_TO_DRAW = 50000;
    
    let totalVisualLines = 0;
    for (let i = 0; i < numLayers - 1; i++) {
      totalVisualLines += visualLayers[i] * visualLayers[i+1];
    }

    let lineOpacity = Math.max(0.01, Math.min(0.3, 500 / totalVisualLines));
    ctx.strokeStyle = `rgba(59, 130, 246, ${lineOpacity})`;
    ctx.lineWidth = totalVisualLines > 10000 ? 0.5 : 1;

    let skipRate = totalVisualLines > MAX_LINES_TO_DRAW ? Math.ceil(totalVisualLines / MAX_LINES_TO_DRAW) : 1;
    let counter = 0;

    for (let i = 0; i < numLayers - 1; i++) {
      const currentLayer = nodePositions[i];
      const nextLayer = nodePositions[i+1];

      for (let j = 0; j < currentLayer.length; j++) {
        for (let k = 0; k < nextLayer.length; k++) {
          counter++;
          if (counter % skipRate !== 0) continue;

          ctx.moveTo(currentLayer[j].x, currentLayer[j].y);
          ctx.lineTo(nextLayer[k].x, nextLayer[k].y);
        }
      }
    }
    ctx.stroke();

    // Nodes (Neurons)
    ctx.lineWidth = nodeRadius > 3 ? 2 : 1;
    for (let i = 0; i < numLayers; i++) {
      const isInput = i === 0;
      const isOutput = i === numLayers - 1;

      let fill = '#1e293b';
      let stroke = '#8b5cf6'; // Hidden
      if (isInput) stroke = '#10b981'; // Green input
      if (isOutput) stroke = '#ef4444'; // Red output

      ctx.fillStyle = fill;
      ctx.strokeStyle = stroke;

      const layerPositions = nodePositions[i];
      for (let j = 0; j < layerPositions.length; j++) {
        ctx.beginPath();
        ctx.arc(layerPositions[j].x, layerPositions[j].y, nodeRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }

    // Capped hidden nodes indicator
    for (let i = 0; i < numLayers; i++) {
      if (layers[i] > VISUAL_MAX_NODES) {
        const x = paddingX + (i * layerSpacing);
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '12px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(`+${layers[i] - VISUAL_MAX_NODES} nodes hidden`, x, height - paddingY + 30);
      }
    }
  };

  // Initial render & resize updates
  useEffect(() => {
    handleVisualize();
  }, []);

  useEffect(() => {
    drawNetwork(archData.layers);

    const handleResize = () => {
      drawNetwork(archData.layers);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [archData]);

  return (
    <main className="visualizer-container">
      {/* Controls */}
      <header className="controls-header">
        <div className="config-controls">
          <div className="input-group preset-group">
            <label htmlFor="presetSelect">Configuration:</label>
            <select id="presetSelect" className="preset-select" value={preset} onChange={handlePresetChange}>
              {presets.map((item, idx) => {
                if (item.group) {
                  return (
                    <optgroup label={item.group} key={idx}>
                      {item.items.map((sub, sidx) => (
                        <option value={sub.value} key={sidx}>{sub.label}</option>
                      ))}
                    </optgroup>
                  );
                }
                return <option value={item.value} key={idx}>{item.label}</option>;
              })}
            </select>
          </div>

          <div className="input-group">
            <label htmlFor="paramInput">Number of Parameters:</label>
            <input 
              type="number" 
              id="paramInput" 
              min="1" 
              max="10000000" 
              value={paramInput} 
              onChange={(e) => {
                setParamInput(e.target.value);
                setPreset('custom');
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleVisualize();
              }}
              placeholder="e.g. 1000"
            />
            
            <label htmlFor="hiddenLayersInput" style={{ marginLeft: '1rem' }}>Hidden Layers:</label>
            <input 
              type="number" 
              id="hiddenLayersInput" 
              min="1" 
              max="20" 
              value={hiddenInput} 
              onChange={(e) => {
                setHiddenInput(e.target.value);
                setPreset('custom');
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleVisualize();
              }}
              style={{ width: '80px' }}
              placeholder="e.g. 2"
            />
            
            <button id="drawBtn" className="btn-primary" onClick={handleVisualize}>Visualize</button>
          </div>
        </div>
        
        <div className="stats-panel" id="statsPanel">
          <div className="stat-box">
            <span class="stat-title">Requested</span>
            <span class="stat-value" id="valRequested">{archData.requested.toLocaleString()}</span>
          </div>
          <div className="stat-box">
            <span class="stat-title">Actual Rendered</span>
            <span class="stat-value highlight" id="valActual">{archData.actual.toLocaleString()}</span>
          </div>
          <div className="stat-box">
            <span class="stat-title">Architecture</span>
            <span class="stat-value arch" id="valArch">
              {archData.layers.join(' → ')}
            </span>
          </div>
        </div>

        <div className="legend-panel" id="legendPanel">
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#10b981' }}></span>
            <span>Input Nodes: <strong>{archData.inputNodes.toLocaleString()}</strong></span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#8b5cf6' }}></span>
            <span>Hidden Nodes: <strong>{archData.hiddenNodes.toLocaleString()}</strong></span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#ef4444' }}></span>
            <span>Output Nodes: <strong>{archData.outputNodes.toLocaleString()}</strong></span>
          </div>
        </div>
      </header>

      {/* Canvas Area */}
      <div className="canvas-wrapper">
        <canvas ref={canvasRef} id="paramCanvas"></canvas>
        <div id="loadingOverlay" className={`loading-overlay ${loading ? '' : 'hidden'}`}>
          <div className="spinner"></div>
          <span>Rendering Network...</span>
        </div>
      </div>
    </main>
  );
}
