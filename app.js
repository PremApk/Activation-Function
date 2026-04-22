/* ============================================
   ACTIVATION FUNCTIONS EXPLORER - APP LOGIC
   Data, rendering, interaction, graphing
   ============================================ */

// ── Activation Function Database ─────────────────────────────────────
const activationFunctions = [
    // ═══ CLASSIC ═══
    {
        id: 'binary-step',
        name: 'Binary Step',
        category: 'classic',
        formula: 'f(x) = \\begin{cases} 0 & x < 0 \\\\ 1 & x \\geq 0 \\end{cases}',
        formulaSimple: 'f(x) = 0 \\text{ if } x<0,\\; 1 \\text{ if } x \\geq 0',
        compute: x => x >= 0 ? 1 : 0,
        derivative: x => 0, // undefined at 0, 0 elsewhere
        range: '{0, 1}',
        description: 'The simplest activation function that outputs a binary decision. Historically used in perceptrons, it maps any input to either 0 or 1 based on a threshold.',
        bestCase: 'Simple binary classifiers and perceptrons where a hard threshold decision is needed. Useful as a conceptual building block for understanding neural networks.',
        worstCase: 'Cannot be used with gradient-based optimizers (gradient is zero everywhere). Not suitable for hidden layers in any modern architecture. No learning possible through back-propagation.',
        models: ['Perceptron (1958)', 'McCulloch-Pitts Neuron', 'Threshold Logic Units'],
        accentColor: '#f59e0b'
    },
    {
        id: 'linear',
        name: 'Linear (Identity)',
        category: 'classic',
        formula: 'f(x) = x',
        compute: x => x,
        derivative: x => 1,
        range: '(-∞, +∞)',
        description: 'The identity function passes input directly to output without any transformation. While simple, it serves important roles in certain network architectures.',
        bestCase: 'Regression output layers where unbounded continuous output is needed. Skip connections in ResNets. Linear layers before activation in transformer architectures.',
        worstCase: 'Stacking multiple linear layers collapses to a single linear transformation — no ability to learn non-linear representations. Unsuitable for hidden layers in classification tasks.',
        models: ['ResNet (skip connections)', 'Linear Regression', 'Transformer FFN (pre-activation)'],
        accentColor: '#6b7280'
    },
    {
        id: 'sigmoid',
        name: 'Sigmoid (Logistic)',
        category: 'classic',
        formula: '\\sigma(x) = \\frac{1}{1 + e^{-x}}',
        compute: x => 1 / (1 + Math.exp(-x)),
        derivative: x => {
            const s = 1 / (1 + Math.exp(-x));
            return s * (1 - s);
        },
        range: '(0, 1)',
        description: 'The classic S-shaped curve that squashes any real number into the (0, 1) range. One of the earliest activation functions, it remains essential for probability estimation and gating mechanisms.',
        bestCase: 'Binary classification output layers for probability scores. Gate mechanisms inside LSTM and GRU cells. Attention mechanisms requiring values between 0 and 1.',
        worstCase: 'Vanishing gradient problem in deep networks — gradients shrink exponentially during backpropagation. Output is not zero-centered, causing zig-zag updates. Saturates for large |x| values.',
        models: ['LSTM (gate activations)', 'GRU (gate activations)', 'Logistic Regression', 'Early CNNs (LeNet)', 'Attention Gates'],
        accentColor: '#ef4444'
    },
    {
        id: 'tanh',
        name: 'Tanh',
        category: 'classic',
        formula: '\\tanh(x) = \\frac{e^{x} - e^{-x}}{e^{x} + e^{-x}}',
        compute: x => Math.tanh(x),
        derivative: x => 1 - Math.tanh(x) ** 2,
        range: '(-1, +1)',
        description: 'Hyperbolic tangent function — a zero-centered version of sigmoid. Outputs range from -1 to 1, making it preferred over sigmoid for hidden layers in earlier networks.',
        bestCase: 'RNN and LSTM cell state activations. Hidden layers where zero-centered output is important for convergence. Feature normalization in certain architectures.',
        worstCase: 'Still suffers from vanishing gradients for deep networks (though less than sigmoid). Computationally more expensive than ReLU. Saturates at extreme values.',
        models: ['LSTM (cell state)', 'Vanilla RNN', 'GRU (candidate hidden state)', 'Early Deep Networks', 'Transformer layer norms'],
        accentColor: '#8b5cf6'
    },

    // ═══ RELU FAMILY ═══
    {
        id: 'relu',
        name: 'ReLU',
        category: 'relu',
        formula: 'f(x) = \\max(0, x)',
        compute: x => Math.max(0, x),
        derivative: x => x > 0 ? 1 : 0,
        range: '[0, +∞)',
        description: 'Rectified Linear Unit — the most widely used activation function in deep learning. Its simplicity and effectiveness revolutionized training of deep networks by mitigating the vanishing gradient problem.',
        bestCase: 'Default choice for hidden layers in CNNs and feedforward networks. Very fast computation (simple thresholding). Enables efficient training of very deep networks. Sparse activation improves efficiency.',
        worstCase: '"Dying ReLU" problem — neurons can get permanently stuck outputting 0 if they always receive negative inputs. Not zero-centered. Not differentiable at x=0.',
        models: ['AlexNet', 'VGG', 'ResNet', 'Inception', 'DenseNet', 'U-Net', 'Most modern CNNs'],
        accentColor: '#3b82f6'
    },
    {
        id: 'leaky-relu',
        name: 'Leaky ReLU',
        category: 'relu',
        formula: 'f(x) = \\begin{cases} x & x > 0 \\\\ 0.01x & x \\leq 0 \\end{cases}',
        formulaSimple: 'f(x) = \\max(0.01x,\\; x)',
        compute: x => x > 0 ? x : 0.01 * x,
        derivative: x => x > 0 ? 1 : 0.01,
        range: '(-∞, +∞)',
        description: 'A variant of ReLU that allows a small, non-zero gradient for negative inputs. This prevents the "dying ReLU" problem by ensuring neurons always have some gradient flow.',
        bestCase: 'When dying ReLU is a concern. Object detection networks (YOLO series). GANs where gradient flow through all neurons is critical. Deep networks prone to dead neurons.',
        worstCase: 'The small slope (0.01) is arbitrary and may not be optimal. Still not zero-centered for positive values. Marginal improvement over ReLU in many practical cases.',
        models: ['YOLOv1-v3', 'Darknet', 'DCGAN', 'CycleGAN', 'Some ResNet variants'],
        accentColor: '#06b6d4'
    },
    {
        id: 'prelu',
        name: 'PReLU',
        category: 'relu',
        formula: 'f(x) = \\begin{cases} x & x > 0 \\\\ \\alpha x & x \\leq 0 \\end{cases}',
        formulaSimple: 'f(x) = \\max(\\alpha x,\\; x),\\; \\alpha \\text{ is learnable}',
        compute: x => x > 0 ? x : 0.25 * x, // demo with α=0.25
        derivative: x => x > 0 ? 1 : 0.25,
        range: '(-∞, +∞)',
        description: 'Parametric ReLU — the negative slope α is a learnable parameter trained via backpropagation. This allows the network to adaptively learn the optimal slope for each neuron.',
        bestCase: 'When the optimal negative slope varies by layer or neuron. Image recognition tasks where adaptive activation helps. Deeper networks that benefit from learned non-linearity.',
        worstCase: 'Adds additional parameters to train, increasing model complexity. Risk of overfitting on small datasets. α shown as 0.25 for demo — actual value is learned during training.',
        models: ['PReLU-Net (He et al.)', 'Deep Image Recognition', 'Some ResNet variants', 'Face Recognition Networks'],
        accentColor: '#0ea5e9'
    },
    {
        id: 'elu',
        name: 'ELU',
        category: 'relu',
        formula: 'f(x) = \\begin{cases} x & x > 0 \\\\ \\alpha(e^{x} - 1) & x \\leq 0 \\end{cases}',
        compute: x => x > 0 ? x : 1.0 * (Math.exp(x) - 1),
        derivative: x => x > 0 ? 1 : Math.exp(x),
        range: '(-α, +∞)',
        description: 'Exponential Linear Unit — uses an exponential curve for negative values, producing smooth and continuous outputs. Pushes mean activations closer to zero, acting as a form of self-normalization.',
        bestCase: 'Deep networks where batch normalization isn\'t used. Faster convergence than ReLU due to zero-centered outputs. Reduces the need for bias shifts in subsequent layers.',
        worstCase: 'Computationally more expensive than ReLU (exponential computation). Saturates for very negative values. α is a hyperparameter that must be tuned (default α=1).',
        models: ['Deep Residual Networks', 'Self-normalizing Networks', 'Image Classification Models', 'Variational Autoencoders'],
        accentColor: '#10b981'
    },
    {
        id: 'selu',
        name: 'SELU',
        category: 'relu',
        formula: 'f(x) = \\lambda \\begin{cases} x & x > 0 \\\\ \\alpha(e^{x} - 1) & x \\leq 0 \\end{cases}',
        compute: x => {
            const alpha = 1.6732632423543772;
            const lambda = 1.0507009873554805;
            return x > 0 ? lambda * x : lambda * alpha * (Math.exp(x) - 1);
        },
        derivative: x => {
            const alpha = 1.6732632423543772;
            const lambda = 1.0507009873554805;
            return x > 0 ? lambda : lambda * alpha * Math.exp(x);
        },
        range: '(-λα, +∞)',
        description: 'Scaled ELU with carefully chosen constants (λ≈1.0507, α≈1.6733) that enable self-normalizing properties. Activations automatically converge to zero mean and unit variance during training.',
        bestCase: 'Fully-connected (dense) networks without batch normalization. Self-Normalizing Neural Networks (SNNs). Scenarios where automatic normalization is desired. Tabular data problems.',
        worstCase: 'Self-normalizing property requires specific initialization (LeCun normal) and architecture constraints. Doesn\'t work well with skip connections or CNNs. Requires AlphaDropout instead of regular dropout.',
        models: ['Self-Normalizing Networks (Klambauer et al.)', 'Dense Networks for Tabular Data', 'Drug Discovery Models'],
        accentColor: '#14b8a6'
    },
    {
        id: 'relu6',
        name: 'ReLU6',
        category: 'relu',
        formula: 'f(x) = \\min(\\max(0, x),\\; 6)',
        compute: x => Math.min(Math.max(0, x), 6),
        derivative: x => (x > 0 && x < 6) ? 1 : 0,
        range: '[0, 6]',
        description: 'A capped version of ReLU that clips the output at 6. Designed for mobile and embedded devices where fixed-point arithmetic requires bounded activations. Encourages sparse features while keeping values manageable.',
        bestCase: 'Mobile and edge deployment with quantized models. MobileNet architectures. Low-precision fixed-point inference. Preventing extremely large activations in shallow networks.',
        worstCase: 'The cap at 6 is arbitrary and can limit representational capacity. Loses gradient information for x > 6 (similar to dying ReLU for x < 0). Not commonly used in large-scale models.',
        models: ['MobileNetV1', 'MobileNetV2', 'TensorFlow Lite Models', 'Edge TPU Models', 'SqueezeNet'],
        accentColor: '#6366f1'
    },

    // ═══ MODERN ═══
    {
        id: 'gelu',
        name: 'GELU',
        category: 'modern',
        formula: 'f(x) = x \\cdot \\Phi(x) \\approx 0.5x\\left(1 + \\tanh\\left[\\sqrt{\\frac{2}{\\pi}}\\left(x + 0.044715x^{3}\\right)\\right]\\right)',
        compute: x => {
            return 0.5 * x * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * x * x * x)));
        },
        derivative: x => {
            const k = Math.sqrt(2 / Math.PI);
            const inner = k * (x + 0.044715 * x * x * x);
            const tanhVal = Math.tanh(inner);
            const sech2 = 1 - tanhVal * tanhVal;
            const dInner = k * (1 + 3 * 0.044715 * x * x);
            return 0.5 * (1 + tanhVal) + 0.5 * x * sech2 * dInner;
        },
        range: '(-0.17, +∞)',
        description: 'Gaussian Error Linear Unit — combines the input with its cumulative Gaussian distribution. Smoothly gates values based on their magnitude, allowing a probabilistic approach to activation. The dominant activation in modern transformers.',
        bestCase: 'Transformer architectures (the standard choice). NLP models where smooth, probabilistic gating improves performance. Vision Transformers (ViT). Any large-scale pre-trained model.',
        worstCase: 'Computationally more expensive than ReLU (requires tanh approximation). Marginal gains over Swish in some benchmarks. Complex gradient computation. Not ideal for real-time edge inference.',
        models: ['BERT', 'GPT-2', 'GPT-3', 'GPT-4', 'ChatGPT', 'ViT', 'RoBERTa', 'DeBERTa', 'ALBERT', 'CLIP', 'Codex'],
        accentColor: '#a855f7'
    },
    {
        id: 'swish',
        name: 'Swish (SiLU)',
        category: 'modern',
        formula: 'f(x) = x \\cdot \\sigma(x) = \\frac{x}{1 + e^{-x}}',
        compute: x => x / (1 + Math.exp(-x)),
        derivative: x => {
            const s = 1 / (1 + Math.exp(-x));
            return s + x * s * (1 - s);
        },
        range: '(-0.28, +∞)',
        description: 'Self-gated activation discovered through automated search by Google Brain. Multiplies input by its own sigmoid, creating a smooth, non-monotonic function. Also known as SiLU (Sigmoid-weighted Linear Unit). Key component of SwiGLU used in most modern LLMs.',
        bestCase: 'Deep networks where smooth gradients matter. EfficientNet and similar architectures. As part of SwiGLU in modern LLMs (LLaMA, Mistral, Gemini). Outperforms ReLU in deeper models.',
        worstCase: 'Slightly more expensive than ReLU. Non-monotonic behavior can complicate optimization in some edge cases. Unbounded above but bounded below, similar asymmetry to ReLU.',
        models: ['EfficientNet', 'LLaMA 1/2/3 (as SwiGLU)', 'PaLM (as SwiGLU)', 'Gemini (as SwiGLU)', 'Mistral', 'Mixtral', 'Stable Diffusion U-Net'],
        accentColor: '#ec4899'
    },
    {
        id: 'mish',
        name: 'Mish',
        category: 'modern',
        formula: 'f(x) = x \\cdot \\tanh(\\text{softplus}(x)) = x \\cdot \\tanh(\\ln(1 + e^{x}))',
        compute: x => x * Math.tanh(Math.log(1 + Math.exp(x))),
        derivative: x => {
            const sp = Math.log(1 + Math.exp(x));
            const tsp = Math.tanh(sp);
            const sig = 1 / (1 + Math.exp(-x));
            const omega = 4 * (x + 1) + 4 * Math.exp(2 * x) + Math.exp(3 * x) + Math.exp(x) * (4 * x + 6);
            const delta = 2 * Math.exp(x) + Math.exp(2 * x) + 2;
            return Math.exp(x) * omega / (delta * delta);
        },
        range: '(-0.31, +∞)',
        description: 'A self-regularized, non-monotonic activation function. Combines tanh and softplus for smooth gradients at all points. Empirically shown to outperform ReLU and Swish in computer vision tasks.',
        bestCase: 'Object detection (YOLO series). Computer vision models requiring smooth gradients. Deep CNNs where training stability matters. Tasks sensitive to gradient flow quality.',
        worstCase: 'Most computationally expensive among common activations (two non-linear ops). Complex derivative slows backpropagation. Minimal gain over Swish in many NLP tasks.',
        models: ['YOLOv4', 'YOLOv5', 'YOLOv7', 'CSPNet', 'PANet', 'Darknet53'],
        accentColor: '#f43f5e'
    },
    {
        id: 'softplus',
        name: 'Softplus',
        category: 'modern',
        formula: 'f(x) = \\ln(1 + e^{x})',
        compute: x => Math.log(1 + Math.exp(x)),
        derivative: x => 1 / (1 + Math.exp(-x)), // sigmoid!
        range: '(0, +∞)',
        description: 'A smooth approximation of ReLU — its derivative is the sigmoid function. Always positive and differentiable everywhere, making it useful where strict positivity and smoothness are required.',
        bestCase: 'Modeling positive quantities (variance, scale parameters). Smooth approximation of ReLU where differentiability matters. Normalizing flows. As a building block in Mish activation.',
        worstCase: 'Not zero-centered. Computationally more expensive than ReLU. Doesn\'t have the sparse activation benefit of ReLU. Can suffer from numerical overflow for very large x.',
        models: ['Boltzmann Machines', 'Normalizing Flows', 'Variational Autoencoders', 'Mish (as building block)', 'Bayesian Neural Networks'],
        accentColor: '#f97316'
    },

    // ═══ SPECIALIZED ═══
    {
        id: 'hard-sigmoid',
        name: 'Hard Sigmoid',
        category: 'specialized',
        formula: 'f(x) = \\text{clip}\\left(\\frac{x + 3}{6},\\; 0,\\; 1\\right)',
        compute: x => Math.max(0, Math.min(1, (x + 3) / 6)),
        derivative: x => (x > -3 && x < 3) ? 1 / 6 : 0,
        range: '[0, 1]',
        description: 'A piecewise linear approximation of the sigmoid function. Much faster to compute while maintaining similar behavior, making it ideal for resource-constrained environments.',
        bestCase: 'Mobile and embedded inference where sigmoid is too expensive. Quantization-friendly architectures. Hardware accelerators with limited floating-point support. As a gate in efficient RNN implementations.',
        worstCase: 'Less smooth than true sigmoid — piecewise linear nature can affect gradient quality. The approximation is coarse, potentially reducing model accuracy. Not suitable where precise probability outputs are needed.',
        models: ['MobileNetV3 (SE blocks)', 'EfficientNet-Lite', 'TFLite optimized models', 'Efficient LSTM implementations'],
        accentColor: '#84cc16'
    },
    {
        id: 'hard-swish',
        name: 'Hard Swish',
        category: 'specialized',
        formula: 'f(x) = x \\cdot \\text{HardSigmoid}(x) = x \\cdot \\frac{\\text{clip}(x+3, 0, 6)}{6}',
        compute: x => x * Math.max(0, Math.min(1, (x + 3) / 6)),
        derivative: x => {
            if (x < -3) return 0;
            if (x > 3) return 1;
            return (2 * x + 3) / 6;
        },
        range: '(-0.375, +∞)',
        description: 'A computationally efficient approximation of Swish using Hard Sigmoid instead of Sigmoid. Provides similar accuracy benefits as Swish while being much faster to compute, especially on mobile hardware.',
        bestCase: 'Mobile-first architectures (MobileNetV3). On-device inference where Swish is too expensive. Quantization pipelines. Edge AI deployment with limited computational budget.',
        worstCase: 'Non-smooth transitions at x = -3 and x = 3. Less expressive than true Swish. The approximation may reduce effectiveness in very deep or large-scale models.',
        models: ['MobileNetV3', 'EfficientNet-Lite', 'MNASNet', 'FBNet', 'Pixel Neural Core'],
        accentColor: '#22c55e'
    },
    {
        id: 'softsign',
        name: 'Softsign',
        category: 'specialized',
        formula: 'f(x) = \\frac{x}{1 + |x|}',
        compute: x => x / (1 + Math.abs(x)),
        derivative: x => 1 / ((1 + Math.abs(x)) ** 2),
        range: '(-1, +1)',
        description: 'A smoother alternative to tanh that approaches its asymptotes more slowly. The polynomial nature (vs. exponential in tanh) means it has a flatter region around zero and slower saturation.',
        bestCase: 'When slower saturation than tanh is desired. Certain RNN architectures. Tasks where the gradual approach to bounds improves generalization. Computationally simpler than tanh.',
        worstCase: 'Less commonly used and studied than tanh. Slower convergence in practice for many tasks. Limited framework optimizations compared to tanh and ReLU.',
        models: ['Some RNN architectures', 'Quadratic Networks', 'Experimental Architectures'],
        accentColor: '#a3e635'
    },
    {
        id: 'gaussian',
        name: 'Gaussian',
        category: 'specialized',
        formula: 'f(x) = e^{-x^2}',
        compute: x => Math.exp(-x * x),
        derivative: x => -2 * x * Math.exp(-x * x),
        range: '(0, 1]',
        description: 'A bell-shaped activation based on the Gaussian function. Unique among activations for being non-monotonic and approaching zero for both large positive and negative inputs. Useful for modeling uncertainty.',
        bestCase: 'Radial Basis Function (RBF) networks. Pattern recognition with localized receptive fields. Function approximation where inputs are expected to cluster around specific centers. Probabilistic modeling.',
        worstCase: 'Vanishing gradients for both large positive and negative values. Limited representational power in deep networks. Not suitable as a general-purpose activation. Rarely used in modern architectures.',
        models: ['RBF Networks', 'Gaussian Processes', 'Probabilistic Neural Networks', 'Some Clustering Models'],
        accentColor: '#e879f9'
    },
];

// ── Category Display Names ───────────────────────────────────────────
const categoryLabels = {
    classic: 'Classic',
    relu: 'ReLU Family',
    modern: 'Modern',
    specialized: 'Specialized'
};

// ── DOM References ───────────────────────────────────────────────────
const slider = document.getElementById('inputSlider');
const sliderValueEl = document.getElementById('sliderValue');
const sliderFill = document.getElementById('sliderFill');
const cardsGrid = document.getElementById('cardsGrid');
const filterBtns = document.querySelectorAll('.filter-btn');
const modalOverlay = document.getElementById('modalOverlay');
const modal = document.getElementById('modal');
const modalClose = document.getElementById('modalClose');
const derivativeToggle = document.getElementById('derivativeToggle');
const legendDeriv = document.getElementById('legendDeriv');

// ── State ────────────────────────────────────────────────────────────
let currentInput = 0;
let currentCategory = 'all';
let activeModal = null;
let modalChart = null;
const cardCanvases = new Map(); // id -> canvas element

// ── Initialize ───────────────────────────────────────────────────────
function init() {
    renderCards();
    updateSlider(0);
    setupEventListeners();
}

// ── Card Rendering ───────────────────────────────────────────────────
function renderCards() {
    cardsGrid.innerHTML = '';

    activationFunctions.forEach((fn, index) => {
        const card = document.createElement('div');
        card.className = `af-card`;
        card.dataset.category = fn.category;
        card.dataset.id = fn.id;
        card.style.setProperty('--card-accent', fn.accentColor);
        card.style.animationDelay = `${index * 0.04}s`;

        card.innerHTML = `
            <div class="card-top">
                <span class="card-name">${fn.name}</span>
                <span class="card-category ${fn.category}">${categoryLabels[fn.category]}</span>
            </div>
            <canvas class="card-graph" id="canvas-${fn.id}" width="600" height="200"></canvas>
            <div class="card-output-row">
                <div class="card-output">
                    <span class="card-output-label">f(${currentInput.toFixed(2)})</span>
                    <span class="card-output-value" id="value-${fn.id}" style="color: ${fn.accentColor}">
                        ${formatOutput(fn.compute(currentInput))}
                    </span>
                </div>
                <div class="card-cta">
                    <span>Learn more</span>
                    <span class="arrow">→</span>
                </div>
            </div>
        `;

        card.addEventListener('click', () => openModal(fn));
        cardsGrid.appendChild(card);

        // Draw initial mini graph
        const canvas = card.querySelector(`#canvas-${fn.id}`);
        cardCanvases.set(fn.id, canvas);
        drawMiniGraph(canvas, fn, currentInput);
    });
}

// ── Mini Graph Drawing (Canvas) ──────────────────────────────────────
function drawMiniGraph(canvas, fn, inputX) {
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const w = rect.width || canvas.width / 2;
    const h = rect.height || canvas.height / 2;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';

    ctx.clearRect(0, 0, w, h);

    const padding = { top: 8, bottom: 8, left: 8, right: 8 };
    const plotW = w - padding.left - padding.right;
    const plotH = h - padding.top - padding.bottom;

    // Compute range for y-axis
    const xMin = -5, xMax = 5;
    let yMin = -2, yMax = 2;

    // Sample to find actual range
    const samples = [];
    for (let i = 0; i <= 200; i++) {
        const x = xMin + (xMax - xMin) * (i / 200);
        const y = fn.compute(x);
        if (isFinite(y)) samples.push(y);
    }
    if (samples.length > 0) {
        const sMin = Math.min(...samples);
        const sMax = Math.max(...samples);
        const sRange = sMax - sMin || 1;
        yMin = sMin - sRange * 0.15;
        yMax = sMax + sRange * 0.15;
    }

    const toCanvasX = x => padding.left + ((x - xMin) / (xMax - xMin)) * plotW;
    const toCanvasY = y => padding.top + ((yMax - y) / (yMax - yMin)) * plotH;

    // Grid lines (very subtle)
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;

    // Horizontal zero line
    if (yMin <= 0 && yMax >= 0) {
        const zeroY = toCanvasY(0);
        ctx.beginPath();
        ctx.moveTo(padding.left, zeroY);
        ctx.lineTo(w - padding.right, zeroY);
        ctx.stroke();
    }

    // Vertical zero line
    const zeroX = toCanvasX(0);
    ctx.beginPath();
    ctx.moveTo(zeroX, padding.top);
    ctx.lineTo(zeroX, h - padding.bottom);
    ctx.stroke();

    // Function curve
    ctx.beginPath();
    ctx.strokeStyle = fn.accentColor;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    let started = false;
    for (let i = 0; i <= 200; i++) {
        const x = xMin + (xMax - xMin) * (i / 200);
        const y = fn.compute(x);
        if (!isFinite(y)) continue;
        const cx = toCanvasX(x);
        const cy = toCanvasY(y);
        if (!started) {
            ctx.moveTo(cx, cy);
            started = true;
        } else {
            ctx.lineTo(cx, cy);
        }
    }
    ctx.stroke();

    // Gradient fill under curve
    const gradient = ctx.createLinearGradient(0, padding.top, 0, h - padding.bottom);
    gradient.addColorStop(0, fn.accentColor + '18');
    gradient.addColorStop(1, fn.accentColor + '02');

    ctx.beginPath();
    started = false;
    let firstCx = 0;
    for (let i = 0; i <= 200; i++) {
        const x = xMin + (xMax - xMin) * (i / 200);
        const y = fn.compute(x);
        if (!isFinite(y)) continue;
        const cx = toCanvasX(x);
        const cy = toCanvasY(y);
        if (!started) {
            firstCx = cx;
            ctx.moveTo(cx, cy);
            started = true;
        } else {
            ctx.lineTo(cx, cy);
        }
    }
    // Close the fill
    const baselineY = toCanvasY(0);
    ctx.lineTo(toCanvasX(xMax), baselineY);
    ctx.lineTo(firstCx, baselineY);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Current input point
    const outputY = fn.compute(inputX);
    if (isFinite(outputY)) {
        const px = toCanvasX(inputX);
        const py = toCanvasY(outputY);

        // Glow
        ctx.beginPath();
        ctx.arc(px, py, 8, 0, Math.PI * 2);
        ctx.fillStyle = fn.accentColor + '30';
        ctx.fill();

        // Outer ring
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, Math.PI * 2);
        ctx.fillStyle = fn.accentColor + '60';
        ctx.fill();

        // Inner dot
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        // Vertical dashed line from point to x-axis
        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = 'rgba(255,255,255,0.12)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px, baselineY);
        ctx.stroke();
        ctx.setLineDash([]);
    }
}

// ── Update All Cards ─────────────────────────────────────────────────
function updateAllCards(inputX) {
    activationFunctions.forEach(fn => {
        // Update output value
        const valueEl = document.getElementById(`value-${fn.id}`);
        const labelEl = valueEl?.previousElementSibling;
        if (valueEl) {
            const output = fn.compute(inputX);
            valueEl.textContent = formatOutput(output);

            // Color based on sign
            if (output > 0.001) valueEl.className = 'card-output-value';
            else if (output < -0.001) valueEl.className = 'card-output-value';
            else valueEl.className = 'card-output-value';

            valueEl.style.color = fn.accentColor;
        }
        if (labelEl) {
            labelEl.textContent = `f(${inputX.toFixed(2)})`;
        }

        // Redraw mini graph
        const canvas = cardCanvases.get(fn.id);
        if (canvas) drawMiniGraph(canvas, fn, inputX);
    });
}

// ── Slider Handling ──────────────────────────────────────────────────
function updateSlider(value) {
    currentInput = parseFloat(value);
    sliderValueEl.textContent = currentInput.toFixed(2);

    // Update fill
    const pct = ((currentInput - (-5)) / 10) * 100;
    sliderFill.style.width = pct + '%';

    // Update all cards
    updateAllCards(currentInput);

    // Update modal if open
    if (activeModal) {
        updateModalChart(activeModal);
        const outputEl = document.getElementById('modalCurrentOutput');
        if (outputEl) outputEl.textContent = formatOutput(activeModal.compute(currentInput));
    }
}

// ── Format Output Number ─────────────────────────────────────────────
function formatOutput(val) {
    if (!isFinite(val)) return 'undefined';
    if (Math.abs(val) < 0.0001 && val !== 0) return val.toExponential(2);
    if (Math.abs(val) >= 1000) return val.toFixed(1);
    return val.toFixed(4);
}

// ── Filter Handling ──────────────────────────────────────────────────
function filterCards(category) {
    currentCategory = category;

    filterBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === category);
    });

    const cards = cardsGrid.querySelectorAll('.af-card');
    cards.forEach((card, i) => {
        const show = category === 'all' || card.dataset.category === category;
        card.classList.toggle('hidden', !show);
        if (show) {
            card.style.animationDelay = `${i * 0.03}s`;
            card.style.animation = 'none';
            card.offsetHeight; // trigger reflow
            card.style.animation = '';
        }
    });
}

// ── Modal ────────────────────────────────────────────────────────────
function openModal(fn) {
    activeModal = fn;

    // Set content
    document.getElementById('modalTitle').textContent = fn.name;
    document.getElementById('modalDescription').textContent = fn.description;

    const categoryBadge = document.getElementById('modalCategory');
    categoryBadge.textContent = categoryLabels[fn.category];
    categoryBadge.className = `modal-category-badge card-category ${fn.category}`;

    document.getElementById('modalRange').textContent = fn.range;
    document.getElementById('modalCurrentOutput').textContent = formatOutput(fn.compute(currentInput));
    document.getElementById('modalBestCase').textContent = fn.bestCase;
    document.getElementById('modalWorstCase').textContent = fn.worstCase;

    // Render formula with KaTeX
    const formulaEl = document.getElementById('modalFormula');
    try {
        katex.render(fn.formulaSimple || fn.formula, formulaEl, {
            displayMode: true,
            throwOnError: false,
            strict: false
        });
    } catch (e) {
        formulaEl.innerHTML = `<code>${fn.formula}</code>`;
    }

    // Model tags
    const modelsEl = document.getElementById('modalModels');
    modelsEl.innerHTML = fn.models.map(m => `<span class="model-tag">${m}</span>`).join('');

    // Reset derivative toggle
    derivativeToggle.checked = false;
    legendDeriv.classList.remove('visible');

    // Create/update chart
    createModalChart(fn);

    // Show modal
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
    activeModal = null;

    if (modalChart) {
        modalChart.destroy();
        modalChart = null;
    }
}

// ── Chart.js Modal Graph ─────────────────────────────────────────────
function createModalChart(fn) {
    if (modalChart) {
        modalChart.destroy();
    }

    const ctx = document.getElementById('modalChart').getContext('2d');
    const showDerivative = derivativeToggle.checked;

    // Generate data points
    const xMin = -5, xMax = 5, steps = 500;
    const labels = [];
    const fnData = [];
    const derivData = [];

    for (let i = 0; i <= steps; i++) {
        const x = xMin + (xMax - xMin) * (i / steps);
        labels.push(x.toFixed(2));
        const y = fn.compute(x);
        fnData.push(isFinite(y) ? y : null);
        const dy = fn.derivative(x);
        derivData.push(isFinite(dy) ? dy : null);
    }

    // Current point
    const currentOutput = fn.compute(currentInput);
    const currentDeriv = fn.derivative(currentInput);

    const datasets = [
        {
            label: 'f(x)',
            data: fnData,
            borderColor: fn.accentColor,
            backgroundColor: fn.accentColor + '15',
            borderWidth: 2.5,
            fill: true,
            pointRadius: 0,
            tension: 0.1,
            order: 2
        },
        {
            label: "f'(x)",
            data: showDerivative ? derivData : [],
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.08)',
            borderWidth: 2,
            borderDash: [6, 3],
            fill: false,
            pointRadius: 0,
            tension: 0.1,
            hidden: !showDerivative,
            order: 3
        },
        {
            label: 'Current Input',
            data: labels.map((l, i) => {
                const x = parseFloat(l);
                if (Math.abs(x - currentInput) < (xMax - xMin) / steps + 0.001) {
                    return isFinite(currentOutput) ? currentOutput : null;
                }
                return null;
            }),
            borderColor: '#ffffff',
            backgroundColor: '#ffffff',
            pointRadius: labels.map((l) => {
                const x = parseFloat(l);
                return Math.abs(x - currentInput) < (xMax - xMin) / steps + 0.001 ? 7 : 0;
            }),
            pointHoverRadius: 9,
            pointBorderWidth: 3,
            pointBorderColor: fn.accentColor,
            pointBackgroundColor: '#ffffff',
            showLine: false,
            order: 1
        }
    ];

    modalChart = new Chart(ctx, {
        type: 'line',
        data: { labels, datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(10, 12, 24, 0.9)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    titleFont: { family: "'Inter', sans-serif", size: 12 },
                    bodyFont: { family: "'JetBrains Mono', monospace", size: 12 },
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        title: items => `x = ${items[0].label}`,
                        label: item => {
                            if (item.dataset.label === 'Current Input') return null;
                            const v = item.raw;
                            if (v === null) return null;
                            return `${item.dataset.label} = ${v.toFixed(4)}`;
                        }
                    },
                    filter: item => item.raw !== null
                }
            },
            scales: {
                x: {
                    type: 'category',
                    ticks: {
                        maxTicksLimit: 11,
                        color: 'rgba(255,255,255,0.3)',
                        font: { family: "'JetBrains Mono', monospace", size: 10 }
                    },
                    grid: {
                        color: 'rgba(255,255,255,0.04)',
                        drawTicks: false
                    },
                    border: { color: 'rgba(255,255,255,0.08)' }
                },
                y: {
                    ticks: {
                        maxTicksLimit: 8,
                        color: 'rgba(255,255,255,0.3)',
                        font: { family: "'JetBrains Mono', monospace", size: 10 }
                    },
                    grid: {
                        color: 'rgba(255,255,255,0.04)',
                        drawTicks: false
                    },
                    border: { color: 'rgba(255,255,255,0.08)' }
                }
            },
            animation: {
                duration: 400,
                easing: 'easeOutQuart'
            }
        }
    });
}

function updateModalChart(fn) {
    if (!modalChart) return;

    const xMin = -5, xMax = 5, steps = 500;
    const labels = modalChart.data.labels;
    const currentOutput = fn.compute(currentInput);

    // Update current point dataset
    modalChart.data.datasets[2].data = labels.map((l) => {
        const x = parseFloat(l);
        if (Math.abs(x - currentInput) < (xMax - xMin) / steps + 0.001) {
            return isFinite(currentOutput) ? currentOutput : null;
        }
        return null;
    });

    modalChart.data.datasets[2].pointRadius = labels.map((l) => {
        const x = parseFloat(l);
        return Math.abs(x - currentInput) < (xMax - xMin) / steps + 0.001 ? 7 : 0;
    });

    modalChart.update('none');
}

// ── Event Listeners ──────────────────────────────────────────────────
function setupEventListeners() {
    // Slider
    slider.addEventListener('input', e => updateSlider(e.target.value));

    // Filter buttons
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => filterCards(btn.dataset.category));
    });

    // Modal close
    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', e => {
        if (e.target === modalOverlay) closeModal();
    });

    // Escape key
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && activeModal) closeModal();
    });

    // Derivative toggle
    derivativeToggle.addEventListener('change', () => {
        if (!activeModal || !modalChart) return;

        const show = derivativeToggle.checked;
        legendDeriv.classList.toggle('visible', show);

        if (show) {
            const xMin = -5, xMax = 5, steps = 500;
            const derivData = [];
            for (let i = 0; i <= steps; i++) {
                const x = xMin + (xMax - xMin) * (i / steps);
                const dy = activeModal.derivative(x);
                derivData.push(isFinite(dy) ? dy : null);
            }
            modalChart.data.datasets[1].data = derivData;
            modalChart.data.datasets[1].hidden = false;
        } else {
            modalChart.data.datasets[1].hidden = true;
        }
        modalChart.update();
    });

    // Window resize — redraw mini graphs
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            activationFunctions.forEach(fn => {
                const canvas = cardCanvases.get(fn.id);
                if (canvas) drawMiniGraph(canvas, fn, currentInput);
            });
        }, 200);
    });
}

// ── Start ────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', init);
