/* js/parameters.js */

const canvas = document.getElementById('paramCanvas');
const ctx = canvas.getContext('2d', { alpha: false }); // Optimize for no transparency on background
const inputParam = document.getElementById('paramInput');
const inputHidden = document.getElementById('hiddenLayersInput');
const btnDraw = document.getElementById('drawBtn');
const overlay = document.getElementById('loadingOverlay');

// Stats elements
const elRequested = document.getElementById('valRequested');
const elActual = document.getElementById('valActual');
const elArch = document.getElementById('valArch');

// Legend elements
const legendInput = document.getElementById('legendInput');
const legendHidden = document.getElementById('legendHidden');
const legendOutput = document.getElementById('legendOutput');

// Preset element
const presetSelect = document.getElementById('presetSelect');

// Handle resize
function resizeCanvas() {
    const parent = canvas.parentElement;
    // Handle high DPI displays for crisp rendering
    const dpr = window.devicePixelRatio || 1;
    const rect = parent.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    // Scale context to match DPR
    ctx.scale(dpr, dpr);
    
    // Set actual display size
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    
    return { width: rect.width, height: rect.height };
}

window.addEventListener('resize', () => {
    resizeCanvas();
    if (lastArch) {
        drawNetwork(lastArch);
    }
});

let lastArch = null;

// Algorithm to approximate layer architecture given a parameter count
function generateArchitecture(target, numHidden) {
    if (numHidden < 1) numHidden = 1;
    if (target < 2) return Array(numHidden + 2).fill(1); // Min possible network
    
    let bestArch = Array(numHidden + 2).fill(1);
    let minDiff = Infinity;
    
    let approxDim = Math.max(1, Math.sqrt(target / (numHidden + 1)));
    
    // 5000 iterations is very fast in JS (fraction of a millisecond)
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

function calculateParams(arch) {
    let p = 0;
    for(let i=0; i<arch.length-1; i++) {
        p += (arch[i] * arch[i+1]) + arch[i+1]; // weights + biases
    }
    return p;
}

// Renderer
function drawNetwork(layers) {
    const { width, height } = resizeCanvas();
    
    // Background fill
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);
    
    const numLayers = layers.length;
    const paddingX = width * 0.1;
    const paddingY = height * 0.1;
    const usableWidth = width - (paddingX * 2);
    const usableHeight = height - (paddingY * 2);
    
    const layerSpacing = usableWidth / (numLayers - 1 || 1);
    
    // Calculate node positions
    const nodePositions = []; // Array of arrays: [layerIndex][nodeIndex] = {x, y}
    
    // Find the max nodes to scale sizing properly
    const maxNodes = Math.max(...layers);
    
    // Visual capping to prevent browser crash / out of memory when rendering millions
    // We visually clamp nodes per layer to 200, but report the real math.
    const VISUAL_MAX_NODES = 200; 
    const visualLayers = layers.map(n => Math.min(n, VISUAL_MAX_NODES));
    
    // Max nodes visually
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
    
    // Draw Connections (Weights)
    // For massive networks, rendering every line will lag. We use batching.
    ctx.beginPath();
    let linesDrawn = 0;
    const MAX_LINES_TO_DRAW = 50000; 
    
    // Calculate total visual lines
    let totalVisualLines = 0;
    for(let i=0; i<numLayers-1; i++) {
        totalVisualLines += visualLayers[i] * visualLayers[i+1];
    }
    
    // Adjust opacity based on density
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
                if (counter % skipRate !== 0) continue; // Skip lines if too dense
                
                ctx.moveTo(currentLayer[j].x, currentLayer[j].y);
                ctx.lineTo(nextLayer[k].x, nextLayer[k].y);
                linesDrawn++;
            }
        }
    }
    ctx.stroke();
    
    // Draw Nodes (Neurons)
    ctx.lineWidth = nodeRadius > 3 ? 2 : 1;
    for (let i = 0; i < numLayers; i++) {
        const isInput = i === 0;
        const isOutput = i === numLayers - 1;
        
        // Colors
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
    
    // If we visually capped nodes, draw a subtle indicator
    for (let i = 0; i < numLayers; i++) {
        if (layers[i] > VISUAL_MAX_NODES) {
            const x = paddingX + (i * layerSpacing);
            ctx.fillStyle = '#cbd5e1';
            ctx.font = '12px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(`+${layers[i] - VISUAL_MAX_NODES} nodes hidden`, x, height - paddingY + 30);
        }
    }
}

// Action Handler
function visualize() {
    const target = parseInt(inputParam.value);
    const hidden = parseInt(inputHidden.value);
    if (isNaN(target) || target < 1) return;
    
    // Show loading
    overlay.classList.remove('hidden');
    
    // Yield to browser to render the overlay
    setTimeout(() => {
        const arch = generateArchitecture(target, isNaN(hidden) ? 2 : hidden);
        lastArch = arch;
        const actual = calculateParams(arch);
        
        drawNetwork(arch);
        
        // Update DOM stats
        elRequested.textContent = target.toLocaleString();
        elActual.textContent = actual.toLocaleString();
        elArch.textContent = arch.join(' → ');
        
        // Update Legend
        legendInput.textContent = arch[0].toLocaleString();
        let hiddenTotal = 0;
        for (let i = 1; i < arch.length - 1; i++) {
            hiddenTotal += arch[i];
        }
        legendHidden.textContent = hiddenTotal.toLocaleString();
        legendOutput.textContent = arch[arch.length - 1].toLocaleString();
        
        overlay.classList.add('hidden');
    }, 50);
}

// Init
btnDraw.addEventListener('click', visualize);
inputParam.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') visualize();
});
inputHidden.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') visualize();
});
presetSelect.addEventListener('change', (e) => {
    if (e.target.value !== 'custom') {
        const [params, layers] = e.target.value.split(',');
        inputParam.value = params;
        inputHidden.value = layers;
        visualize();
    }
});

// Initial draw
resizeCanvas();
visualize();
