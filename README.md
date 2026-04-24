<div align="center">

# 🧠 Deep Learning Visualization and Learning

### An interactive, visual guide to neural network activation functions and the biological vs artificial neuron connection

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-Visit_Site-blueviolet?style=for-the-badge)](https://premapk.github.io/Activation-Function/)
[![GitHub Pages](https://img.shields.io/badge/Hosted_on-GitHub_Pages-222?style=for-the-badge&logo=github)](https://premapk.github.io/Activation-Function/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

**Slide, visualize, and deeply understand every activation function powering modern AI — from classic Sigmoid to cutting-edge GELU.**

[**🔗 Live Demo**](https://premapk.github.io/Activation-Function/) · [**🐛 Report Bug**](https://github.com/PremApk/Activation-Function/issues) · [**💡 Request Feature**](https://github.com/PremApk/Activation-Function/issues)

</div>

---

## ✨ Features

### 🎚️ Real-Time Interactive Slider
Adjust the input value `x` from **-5 to +5** and watch all 17 activation functions update simultaneously — graphs, output values, and dot indicators respond instantly.

### 📊 17 Activation Functions Covered
Organized into **4 categories** for easy exploration:

| Category | Functions |
|----------|-----------|
| 📜 **Classic** | Binary Step, Linear (Identity), Sigmoid, Tanh |
| 🔷 **ReLU Family** | ReLU, Leaky ReLU, PReLU, ELU, SELU, ReLU6 |
| 🚀 **Modern** | GELU, Swish (SiLU), Mish, Softplus |
| 🎯 **Specialized** | Hard Sigmoid, Hard Swish, Softsign, Gaussian |

### 📐 Detailed Function Breakdowns
Click any function card to open a rich modal with:
- **Interactive Graph** with Chart.js — toggle the derivative overlay on/off
- **Mathematical Formula** rendered with KaTeX
- **Output Range** and real-time computed output
- **Best Use Cases** — when to use this function
- **Limitations & Pitfalls** — when to avoid it
- **Popular Models** — real-world LLMs and architectures using it (GPT-4, LLaMA, BERT, etc.)

### 🧮 Parameter Visualizer
- Enter an arbitrary number of parameters and instantly see how a neural network with that capacity is structured.
- Optimized Canvas rendering engine that visually caps drawing lines but accurately scales and calculates the layers up to millions of parameters.

### 🎨 Premium Dark UI
- Glassmorphism card design with animated gradient orbs
- Smooth micro-animations and hover effects
- Responsive layout — works on desktop, tablet, and mobile
- Category filter buttons with animated transitions

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **HTML5** | Semantic structure |
| **CSS3** | Custom styling, glassmorphism, animations |
| **Vanilla JavaScript** | Core logic, rendering, interactivity |
| **[Chart.js](https://www.chartjs.org/)** | Modal graph visualization with derivative overlay |
| **[KaTeX](https://katex.org/)** | LaTeX math formula rendering |
| **Canvas API** | Mini-graph rendering on each card |

> **Zero build tools required** — no frameworks, no bundlers, no dependencies to install. Just pure HTML, CSS, and JS.

---

## 🚀 Getting Started

### View Live
👉 **[https://premapk.github.io/Activation-Function/](https://premapk.github.io/Activation-Function/)**

### Run Locally

```bash
# Clone the repository
git clone https://github.com/PremApk/Activation-Function.git

# Navigate to the project
cd Activation-Function

# Open in your browser — no build step needed!
# Option 1: Simply open index.html in your browser
start index.html

# Option 2: Use a local server (recommended)
npx serve .
```

---

## 📁 Project Structure

```
Activation-Function/
├── css/
│   ├── home.css            # Landing page styling
│   ├── styles.css          # Activation explorer styling
│   ├── neuron.css          # Neuron page styling
│   └── parameters.css      # Parameter visualizer styling
├── js/
│   ├── app.js              # Logic for activation functions and charts
│   ├── neuron.js           # Logic for biological/artificial neuron interactions
│   └── parameters.js       # Logic for network generation and canvas rendering
├── index.html              # Main landing page for the site
├── activations.html        # Interactive activation functions explorer
├── neuron.html             # Biological vs Artificial neuron guide
├── parameters.html         # Parameter visualizer page
└── README.md               # You are here!
```

---

## 🧮 Functions at a Glance

| Function | Formula | Range | Key Use |
|----------|---------|-------|---------|
| Binary Step | `f(x) = 0 or 1` | {0, 1} | Perceptrons |
| Linear | `f(x) = x` | (-∞, +∞) | Skip connections |
| Sigmoid | `σ(x) = 1/(1+e⁻ˣ)` | (0, 1) | LSTM gates, binary classification |
| Tanh | `tanh(x)` | (-1, +1) | RNN cell states |
| ReLU | `max(0, x)` | [0, +∞) | Default for CNNs |
| Leaky ReLU | `max(0.01x, x)` | (-∞, +∞) | YOLO, GANs |
| PReLU | `max(αx, x)` | (-∞, +∞) | Learnable slope |
| ELU | `x or α(eˣ-1)` | (-α, +∞) | Self-normalizing nets |
| SELU | `λ·ELU(x)` | (-λα, +∞) | Dense networks |
| ReLU6 | `min(max(0,x), 6)` | [0, 6] | MobileNet |
| **GELU** | `x·Φ(x)` | (-0.17, +∞) | **GPT, BERT, ViT** |
| **Swish** | `x·σ(x)` | (-0.28, +∞) | **LLaMA, Gemini** |
| Mish | `x·tanh(softplus(x))` | (-0.31, +∞) | YOLOv4/v5 |
| Softplus | `ln(1+eˣ)` | (0, +∞) | Smooth ReLU approx |
| Hard Sigmoid | `clip((x+3)/6, 0, 1)` | [0, 1] | Mobile inference |
| Hard Swish | `x·HardSigmoid(x)` | (-0.375, +∞) | MobileNetV3 |
| Softsign | `x/(1+\|x\|)` | (-1, +1) | Alternative to tanh |
| Gaussian | `e⁻ˣ²` | (0, 1] | RBF networks |

---

## 🤝 Contributing

Contributions are welcome! If you'd like to add a new activation function or improve the UI:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/new-activation`)
3. **Add** your function to the `activationFunctions` array in `app.js`
4. **Commit** your changes (`git commit -m 'Add new activation function'`)
5. **Push** to the branch (`git push origin feature/new-activation`)
6. **Open** a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**Built with ❤️ for curious minds exploring the building blocks of modern AI.**

⭐ Star this repo if you found it useful!

</div>
