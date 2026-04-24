/* ============================================
   NEURON BASICS PAGE - INTERACTIVITY
   Click handlers, data, detail panels
   ============================================ */

// ── Biological Neuron Parts Data ─────────────────────────────────────
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

// ── Neural Network Components Data ───────────────────────────────────
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
        math: 'z = Σ(wᵢ·xᵢ) + b  ← b is bias'
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
        math: 'ŷ = softmax(W·h + b)'
    }
};

// ── DOM References ───────────────────────────────────────────────────
let activeNeuronPart = null;
let activeNetworkPart = null;

// ── Initialize ───────────────────────────────────────────────────────
function init() {
    setupNeuronDiagram();
    setupNetworkDiagram();
    setupScrollReveal();
}

// ── Neuron Diagram Click Handlers ────────────────────────────────────
function setupNeuronDiagram() {
    const svg = document.getElementById('neuronSvg');
    if (!svg) return;

    const parts = svg.querySelectorAll('.part-group');
    parts.forEach(part => {
        part.addEventListener('click', (e) => {
            e.stopPropagation();
            const partId = part.dataset.part;
            if (!neuronParts[partId]) return;

            // Toggle active state
            parts.forEach(p => p.classList.remove('active'));
            part.classList.add('active');
            activeNeuronPart = partId;

            showDetailPanel('neuronDetail', neuronParts[partId]);
        });
    });
}

// ── Network Diagram Click Handlers ───────────────────────────────────
function setupNetworkDiagram() {
    const svg = document.getElementById('networkSvg');
    if (!svg) return;

    const parts = svg.querySelectorAll('.part-group');
    parts.forEach(part => {
        part.addEventListener('click', (e) => {
            e.stopPropagation();
            const partId = part.dataset.part;
            if (!networkParts[partId]) return;

            parts.forEach(p => p.classList.remove('active'));
            part.classList.add('active');
            activeNetworkPart = partId;

            showDetailPanel('networkDetail', networkParts[partId]);
        });
    });
}

// ── Show Detail Panel ────────────────────────────────────────────────
function showDetailPanel(panelId, data) {
    const panel = document.getElementById(panelId);
    if (!panel) return;

    const empty = panel.querySelector('.detail-panel-empty');
    const content = panel.querySelector('.detail-panel-content');

    if (empty) empty.style.display = 'none';

    // Populate content
    const icon = content.querySelector('.detail-icon');
    const name = content.querySelector('.detail-name');
    const tag = content.querySelector('.detail-tag');
    const desc = content.querySelector('.detail-description');
    const analogyText = content.querySelector('.detail-analogy-text');
    const mathEl = content.querySelector('.detail-math');

    if (icon) {
        icon.textContent = data.icon;
        icon.style.background = data.iconBg;
    }
    if (name) name.textContent = data.name;
    if (tag) {
        tag.textContent = data.tag;
        tag.style.color = data.tagColor;
        tag.style.background = data.tagBg;
    }
    if (desc) desc.textContent = data.description;
    if (analogyText) analogyText.innerHTML = data.analogy;
    if (mathEl) {
        if (data.math) {
            mathEl.textContent = data.math;
            mathEl.style.display = 'block';
        } else {
            mathEl.style.display = 'none';
        }
    }

    // Animate in
    content.classList.remove('visible');
    void content.offsetHeight;
    content.classList.add('visible');
}

// ── Scroll Reveal ────────────────────────────────────────────────────
function setupScrollReveal() {
    const sections = document.querySelectorAll('.reveal-section');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    sections.forEach(s => observer.observe(s));
}

// ── Start ────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', init);
