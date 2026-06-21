import React, { useState, useEffect, useRef } from 'react';
import katex from 'katex';
import { Chart } from 'chart.js/auto';
import MiniGraphCanvas from '../components/MiniGraphCanvas';
import 'katex/dist/katex.min.css';
import '../styles/activations.css';

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
  }
];

const categoryLabels = {
  all: 'All Functions',
  classic: 'Classic',
  relu: 'ReLU Family',
  modern: 'Modern',
  specialized: 'Specialized'
};

function formatOutput(val) {
  if (!isFinite(val)) return 'undefined';
  if (Math.abs(val) < 0.0001 && val !== 0) return val.toExponential(2);
  if (Math.abs(val) >= 1000) return val.toFixed(1);
  return val.toFixed(4);
}

export default function Activations() {
  const [inputX, setInputX] = useState(0.0);
  const [category, setCategory] = useState('all');
  const [activeFn, setActiveFn] = useState(null);
  const [showDerivative, setShowDerivative] = useState(false);

  // References for modal chart
  const modalChartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  // KaTeX formula render ref
  const formulaRef = useRef(null);

  // Filter handlers
  const handleFilterClick = (cat) => {
    setCategory(cat);
  };

  // Open / Close modal
  const handleOpenModal = (fn) => {
    setActiveFn(fn);
    setShowDerivative(false);
    document.body.style.overflow = 'hidden';
  };

  const handleCloseModal = () => {
    document.body.style.overflow = '';
    setActiveFn(null);
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }
  };

  // Math equations Katex updates
  useEffect(() => {
    if (activeFn && formulaRef.current) {
      try {
        const mathStr = activeFn.formulaSimple || activeFn.formula;
        katex.render(mathStr, formulaRef.current, {
          displayMode: true,
          throwOnError: false,
          strict: false
        });
      } catch (err) {
        formulaRef.current.innerHTML = `<code>${activeFn.formula}</code>`;
      }
    }
  }, [activeFn]);

  // Chart.js instance setup & updates
  useEffect(() => {
    if (!activeFn) return;

    // Create chart
    const ctx = modalChartRef.current.getContext('2d');
    const xMin = -5, xMax = 5, steps = 500;
    const labels = [];
    const fnData = [];
    const derivData = [];

    for (let i = 0; i <= steps; i++) {
      const x = xMin + (xMax - xMin) * (i / steps);
      labels.push(x.toFixed(2));
      const y = activeFn.compute(x);
      fnData.push(isFinite(y) ? y : null);
      const dy = activeFn.derivative(x);
      derivData.push(isFinite(dy) ? dy : null);
    }

    const currentOutput = activeFn.compute(inputX);

    // Initial datasets
    const datasets = [
      {
        label: 'f(x)',
        data: fnData,
        borderColor: activeFn.accentColor,
        backgroundColor: activeFn.accentColor + '15',
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
        data: labels.map((l) => {
          const x = parseFloat(l);
          if (Math.abs(x - inputX) < (xMax - xMin) / steps + 0.001) {
            return isFinite(currentOutput) ? currentOutput : null;
          }
          return null;
        }),
        borderColor: '#ffffff',
        backgroundColor: '#ffffff',
        pointRadius: labels.map((l) => {
          const x = parseFloat(l);
          return Math.abs(x - inputX) < (xMax - xMin) / steps + 0.001 ? 7 : 0;
        }),
        pointHoverRadius: 9,
        pointBorderWidth: 3,
        pointBorderColor: activeFn.accentColor,
        pointBackgroundColor: '#ffffff',
        showLine: false,
        order: 1
      }
    ];

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    chartInstanceRef.current = new Chart(ctx, {
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
                const val = item.raw;
                if (val === null) return '';
                return ` ${item.dataset.label}: ${formatOutput(val)}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.04)' },
            ticks: {
              color: '#5c6380',
              font: { family: "'JetBrains Mono', monospace", size: 10 },
              maxTicksLimit: 11
            }
          },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.04)' },
            ticks: {
              color: '#5c6380',
              font: { family: "'JetBrains Mono', monospace", size: 10 }
            }
          }
        }
      }
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [activeFn]);

  // Handle updates to derivative checkbox
  useEffect(() => {
    if (!chartInstanceRef.current || !activeFn) return;
    const chart = chartInstanceRef.current;
    
    // Recalculate derivative dataset
    const show = showDerivative;
    const xMin = -5, xMax = 5, steps = 500;
    const derivData = [];
    
    if (show) {
      for (let i = 0; i <= steps; i++) {
        const x = xMin + (xMax - xMin) * (i / steps);
        const dy = activeFn.derivative(x);
        derivData.push(isFinite(dy) ? dy : null);
      }
    }

    chart.data.datasets[1].data = show ? derivData : [];
    chart.data.datasets[1].hidden = !show;
    chart.update();
  }, [showDerivative]);

  // Fast slider updates on the Chart point marker
  useEffect(() => {
    if (!chartInstanceRef.current || !activeFn) return;
    const chart = chartInstanceRef.current;

    const currentOutput = activeFn.compute(inputX);
    const steps = 500;
    const xMin = -5, xMax = 5;
    const closestIndex = Math.max(0, Math.min(steps, Math.round(((inputX - xMin) / (xMax - xMin)) * steps)));

    const currentInputDataset = chart.data.datasets[2];
    if (currentInputDataset) {
      const newData = new Array(steps + 1).fill(null);
      newData[closestIndex] = isFinite(currentOutput) ? currentOutput : null;
      currentInputDataset.data = newData;

      const newRadii = new Array(steps + 1).fill(0);
      newRadii[closestIndex] = 7;
      currentInputDataset.pointRadius = newRadii;
    }

    chart.update('none'); // Update point immediately without transitions
  }, [inputX, activeFn]);

  // Filters cards based on selected category
  const filteredFunctions = activationFunctions.filter(
    (fn) => category === 'all' || fn.category === category
  );

  return (
    <div className="page-body">
      {/* Hero Section */}
      <header className="hero" id="hero">
        <div className="hero-content">
          <span className="hero-badge">
            <span className="badge-dot"></span>
            Interactive Neural Network Guide
          </span>
          <h1>Activation Functions <span className="gradient-text">Explorer</span></h1>
          <p className="hero-subtitle">Slide, visualize, and deeply understand every activation function powering modern AI &mdash; from classic Sigmoid to cutting-edge GELU.</p>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">18</span>
              <span className="stat-label">Functions</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat">
              <span className="stat-number">4</span>
              <span className="stat-label">Categories</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat">
              <span className="stat-number">∞</span>
              <span className="stat-label">Insights</span>
            </div>
          </div>
        </div>
      </header>

      {/* Sticky Slider Section */}
      <section className="slider-section" id="sliderSection">
        <div className="slider-container">
          <div className="slider-left">
            <div className="slider-label-row">
              <label htmlFor="inputSlider" className="slider-label">Input Value <span className="slider-x">(x)</span></label>
              <div className="slider-value-wrapper">
                <span className="slider-value" id="sliderValue">{inputX.toFixed(2)}</span>
              </div>
            </div>
            <div className="slider-track-wrapper">
              <span className="slider-bound">-5</span>
              <div className="slider-input-container">
                <input 
                  type="range" 
                  id="inputSlider" 
                  min="-5" 
                  max="5" 
                  step="0.01" 
                  value={inputX} 
                  onChange={(e) => setInputX(parseFloat(e.target.value))}
                  aria-label="Input value x"
                />
                <div className="slider-fill" id="sliderFill" style={{ width: `${((inputX - (-5)) / 10) * 100}%` }}></div>
              </div>
              <span className="slider-bound">+5</span>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filters */}
      <section className="filters-section" id="filtersSection">
        <div className="filters-container">
          {Object.keys(categoryLabels).map((catKey) => {
            const iconMap = { all: '⚡', classic: '📜', relu: '🔷', modern: '🚀', specialized: '🎯' };
            return (
              <button 
                key={catKey}
                className={`filter-btn ${category === catKey ? 'active' : ''}`}
                onClick={() => handleFilterClick(catKey)}
              >
                <span className="filter-icon">{iconMap[catKey]}</span> {categoryLabels[catKey]}
              </button>
            );
          })}
        </div>
      </section>

      {/* Cards Grid */}
      <main className="cards-section" id="cardsSection">
        <div className="cards-grid" id="cardsGrid">
          {filteredFunctions.map((fn, index) => {
            const outputVal = fn.compute(inputX);
            return (
              <div 
                key={fn.id} 
                className="af-card"
                style={{ 
                  '--card-accent': fn.accentColor,
                  animationDelay: `${index * 0.04}s`
                }}
                onClick={() => handleOpenModal(fn)}
              >
                <div className="card-top">
                  <span className="card-name">{fn.name}</span>
                  <span className={`card-category ${fn.category}`}>{categoryLabels[fn.category]}</span>
                </div>
                
                {/* Embedded Mini Graph */}
                <MiniGraphCanvas fn={fn} inputX={inputX} />

                <div className="card-output-row">
                  <div className="card-output">
                    <span className="card-output-label">f({inputX.toFixed(2)})</span>
                    <span className="card-output-value" style={{ color: fn.accentColor }}>
                      {formatOutput(outputVal)}
                    </span>
                  </div>
                  <div className="card-cta">
                    <span>Learn more</span>
                    <span className="arrow">→</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Detail Modal Overlay */}
      <div className={`modal-overlay ${activeFn ? 'active' : ''}`} onClick={handleCloseModal}>
        {activeFn && (
          <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <button className="modal-close" onClick={handleCloseModal} aria-label="Close modal">&times;</button>
            <div className="modal-header">
              <span className={`modal-category-badge card-category ${activeFn.category}`}>
                {categoryLabels[activeFn.category]}
              </span>
              <h2 className="modal-title">{activeFn.name}</h2>
              <p className="modal-description">{activeFn.description}</p>
            </div>
            
            <div className="modal-body">
              {/* Graph Section */}
              <div className="modal-graph-section">
                <div className="graph-header">
                  <h3><span className="section-icon">📈</span> Function Graph</h3>
                  <div className="graph-controls">
                    <label className="toggle-label" htmlFor="derivativeToggle">
                      <input 
                        type="checkbox" 
                        id="derivativeToggle" 
                        checked={showDerivative}
                        onChange={(e) => setShowDerivative(e.target.checked)}
                      />
                      <span className="toggle-switch"></span>
                      <span className="toggle-text">Show Derivative</span>
                    </label>
                  </div>
                </div>

                <div className="chart-container">
                  <canvas ref={modalChartRef} id="modalChart"></canvas>
                </div>
                
                <div className="chart-legend">
                  <span className="legend-item"><span className="legend-color legend-fn"></span> f(x)</span>
                  <span className={`legend-item legend-deriv ${showDerivative ? 'visible' : ''}`}>
                    <span className="legend-color legend-dfn"></span> f'(x)
                  </span>
                  <span className="legend-item"><span className="legend-dot"></span> Current Input</span>
                </div>
              </div>

              {/* Info Grid */}
              <div className="modal-info-grid">
                <div className="info-card formula-card" id="formulaCard">
                  <div className="info-card-header">
                    <span className="info-icon">📐</span>
                    <h4>Mathematical Formula</h4>
                  </div>
                  <div ref={formulaRef} className="formula-display" id="modalFormula"></div>
                  <div className="formula-meta">
                    <div className="meta-item">
                      <span className="meta-label">Output Range</span>
                      <span className="meta-value">{activeFn.range}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Current Output</span>
                      <span className="meta-value mono">
                        {formatOutput(activeFn.compute(inputX))}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="info-card best-case-card" id="bestCaseCard">
                  <div className="info-card-header">
                    <span className="info-icon">✅</span>
                    <h4>Best Use Cases</h4>
                  </div>
                  <p className="info-text">{activeFn.bestCase}</p>
                </div>

                <div className="info-card worst-case-card" id="worstCaseCard">
                  <div className="info-card-header">
                    <span className="info-icon">⚠️</span>
                    <h4>Limitations &amp; Pitfalls</h4>
                  </div>
                  <p className="info-text">{activeFn.worstCase}</p>
                </div>

                <div className="info-card models-card" id="modelsCard">
                  <div className="info-card-header">
                    <span className="info-icon">🤖</span>
                    <h4>Popular Models Using This</h4>
                  </div>
                  <div className="model-tags">
                    {activeFn.models.map((model, mIdx) => (
                      <span className="model-tag" key={mIdx}>{model}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
