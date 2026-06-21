import React, { useState } from 'react';
import '../styles/ai_concepts.css';

const concepts = [
  {
    id: 'ai',
    emoji: '🤖',
    title: 'Artificial Intelligence (AI)',
    className: 'circle-ai',
    description: 'The broadest concept. Any technique that enables computers to mimic human intelligence, using logic, if-then rules, decision trees, or machine learning.',
    examples: [
      'Non-player characters (NPCs) in video games',
      'Rule-based chess engines (like Stockfish)',
      'Roomba robot vacuums navigating obstacles'
    ]
  },
  {
    id: 'ml',
    emoji: '📈',
    title: 'Machine Learning (ML)',
    className: 'circle-ml',
    description: 'A subset of AI that includes mathematical algorithms allowing machines to improve at tasks with experience. The machine learns from data instead of being explicitly programmed.',
    examples: [
      'Email spam filters',
      'Netflix or Spotify recommendation algorithms',
      'Zillow housing price predictions'
    ]
  },
  {
    id: 'dl',
    emoji: '🧠',
    title: 'Deep Learning (DL)',
    className: 'circle-dl',
    description: 'A subset of ML composed of algorithms that permit software to train itself to perform tasks by exposing multi-layered (deep) neural networks to vast amounts of data.',
    examples: [
      'Tesla Autopilot (Computer Vision)',
      'Medical imaging tumor detection',
      'Speech-to-text transcription (e.g., Siri)'
    ]
  },
  {
    id: 'genai',
    emoji: '✨',
    title: 'Generative AI',
    className: 'circle-genai',
    description: 'A subset of DL (mostly) that can generate new, novel content—like text, images, audio, or code—rather than simply categorizing or predicting existing data.',
    examples: [
      'Midjourney / DALL-E (Image generation)',
      'Sora (Video generation)',
      'Suno / Udio (Music generation)'
    ]
  },
  {
    id: 'llm',
    emoji: '💬',
    title: 'Large Language Models (LLMs)',
    className: 'circle-llm',
    description: 'A specialized subset of Generative AI focused exclusively on understanding and generating human language, trained on massive datasets using transformer architectures.',
    examples: [
      'OpenAI\'s ChatGPT (GPT-4)',
      'Anthropic\'s Claude',
      'Google\'s Gemini'
    ]
  }
];

export default function AiConcepts() {
  const [activeId, setActiveId] = useState(null);
  const [isHovering, setIsHovering] = useState(false);

  const handleCircleHover = (id, e) => {
    e.stopPropagation();
    setActiveId(id);
    setIsHovering(true);

    // Scroll corresponding card into view
    const cardEl = document.getElementById(`card-${id}`);
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const handleCircleLeave = (e) => {
    setActiveId(null);
    setIsHovering(false);
  };

  const handleCardHover = (id) => {
    setActiveId(id);
    setIsHovering(true);
  };

  const handleCardLeave = () => {
    setActiveId(null);
    setIsHovering(false);
  };

  return (
    <main className="hierarchy-container">
      <header className="hierarchy-header">
        <h1 className="section-title">The <span className="gradient-text">AI Hierarchy</span></h1>
        <p className="section-subtitle">A visual breakdown of Artificial Intelligence and its subfields. Hover or click on the subsets to explore their definitions and real-world applications.</p>
      </header>

      <div className="hierarchy-layout">
        {/* Interactive Diagram Area */}
        <div className={`diagram-area ${isHovering ? 'is-hovering' : ''}`}>
          
          {/* Nested concentric circles */}
          <div 
            className={`circle-container circle-ai ${activeId === 'ai' ? 'active' : ''}`}
            onMouseEnter={(e) => handleCircleHover('ai', e)}
            onMouseLeave={handleCircleLeave}
          >
            <span className="circle-label">Artificial Intelligence (AI)</span>

            <div 
              className={`circle-container circle-ml ${activeId === 'ml' ? 'active' : ''}`}
              onMouseEnter={(e) => handleCircleHover('ml', e)}
              onMouseLeave={handleCircleLeave}
            >
              <span className="circle-label">Machine Learning (ML)</span>

              <div 
                className={`circle-container circle-dl ${activeId === 'dl' ? 'active' : ''}`}
                onMouseEnter={(e) => handleCircleHover('dl', e)}
                onMouseLeave={handleCircleLeave}
              >
                <span className="circle-label">Deep Learning (DL)</span>

                <div 
                  className={`circle-container circle-genai ${activeId === 'genai' ? 'active' : ''}`}
                  onMouseEnter={(e) => handleCircleHover('genai', e)}
                  onMouseLeave={handleCircleLeave}
                >
                  <span className="circle-label">Generative AI</span>

                  <div 
                    className={`circle-container circle-llm ${activeId === 'llm' ? 'active' : ''}`}
                    onMouseEnter={(e) => handleCircleHover('llm', e)}
                    onMouseLeave={handleCircleLeave}
                  >
                    <span className="circle-label">LLMs</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Detail Cards Area */}
        <div className="details-area">
          {concepts.map((concept) => (
            <div
              key={concept.id}
              className={`info-card ${activeId === concept.id ? 'active' : ''}`}
              id={`card-${concept.id}`}
              onMouseEnter={() => handleCardHover(concept.id)}
              onMouseLeave={handleCardLeave}
            >
              <div className="info-card-header">
                <span className="info-icon">{concept.emoji}</span>
                <h4>{concept.title}</h4>
              </div>
              <div className="info-body">
                <p><strong>What it is:</strong> {concept.description}</p>
                <div className="example-box">
                  <span className="example-label">Real-World Examples:</span>
                  <ul>
                    {concept.examples.map((ex, i) => (
                      <li key={i}>{ex}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
