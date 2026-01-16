import React, { useState, useEffect, useRef } from 'react';
import {
  WallGuardVisual,
  ValidatorsVisual,
  ReAskVisual,
  NLPVisual,
  ScorerVisual,
  MonitorVisual,
  ImageGuardVisual
} from './Visuals';

const highlightCode = (code: string) => {
  const parts = code.split(/(\b(?:import|from|as|def|class|return|if|else|for|while|try|except|with|async|await)\b|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|#.*$|\b\d+\b)/gm);

  return parts.map((part, index) => {
    if (/^(import|from|as|def|class|return|if|else|for|while|try|except|with|async|await)$/.test(part)) return <span key={index} className="text-[#2DD4BF]">{part}</span>;
    if (/^["']/.test(part)) return <span key={index} className="text-[#A7F3D0]">{part}</span>;
    if (part.startsWith('#')) return <span key={index} className="text-[#6B7280]">{part}</span>;
    if (/^\d+$/.test(part)) return <span key={index} className="text-[#FDBA74]">{part}</span>;
    return part;
  });
};

const features = [
  {
    id: 1,
    title: "Wall Guard",
    subtitle: "Core Engine",
    description: "The central validation engine that orchestrates sequential validator execution. It acts as a secure middleware between your LLM and the user.",
    visual: <WallGuardVisual />,
    code: `const guard = new WallGuard({
  strategy: 'block',
  fallback: 'Request denied.'
});`,
    tags: ["Middleware", "Security"]
  },
  {
    id: 2,
    title: "Validators",
    subtitle: "Registry",
    description: "A comprehensive registry of pre-built and custom validation rules. Plug and play validators for PII detection, toxicity checks, and JSON schema.",
    visual: <ValidatorsVisual />,
    code: `guard.use([
  new PIIValidator({ redact: true }),
  new ToxicityValidator({ threshold: 0.8 })
]);`,
    tags: ["PII", "Toxicity"]
  },
  {
    id: 3,
    title: "Re-asking",
    subtitle: "Correction",
    description: "Automatically corrects LLM mistakes by feeding validation errors back into the model. This closed-loop system allows the LLM to self-correct.",
    visual: <ReAskVisual />,
    code: `const config = {
  maxRetries: 3,
  feedbackPrompt: (errors) => \`Fix: \${errors}\`
};`,
    tags: ["Loop", "Feedback"]
  },
  {
    id: 4,
    title: "NLP Scorer",
    subtitle: "Semantic",
    description: "Context-aware validation using advanced NLP embeddings. Ensure your LLM stays on topic by measuring semantic similarity.",
    visual: <NLPVisual />,
    code: `const scorer = new NLPScorer({
  embeddings: 'openai-ada-002',
  threshold: 0.85
});`,
    tags: ["Vectors", "Semantic"]
  },
  {
    id: 5,
    title: "Image Guard",
    subtitle: "Visual AI",
    description: "Block inappropriate or off-topic images using Vision LLM validation. Extend your guardrails to multimodal inputs like photos and documents.",
    visual: <ImageGuardVisual />,
    code: `const isSafe = await guard.checkImage({
  image: "upload.jpg", 
  context: "Must be a valid medical X-ray"
});`,
    tags: ["Vision", "Multimodal"]
  },
  {
    id: 6,
    title: "Response Scorer",
    subtitle: "Metrics",
    description: "Quantify the quality of every response. Use industry-standard metrics like ROUGE, BLEU, and BERTScore.",
    visual: <ScorerVisual />,
    code: `await eval.score({
  metrics: ['rouge-l', 'bert-score'],
  output: llmResponse
});`,
    tags: ["ROUGE", "Quality"]
  },
  {
    id: 7,
    title: "LLM Monitor",
    subtitle: "Observability",
    description: "Full-stack observability for your AI application. Track latency, token usage, validation failures, and costs in real-time.",
    visual: <MonitorVisual />,
    code: `monitor.on('validation-fail', (evt) => {
  logger.warn(evt.validator);
});`,
    tags: ["Logging", "Tracing"]
  }
];

const FeaturesScroll: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const { top, height } = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Calculate progress through the section (0 to 1)
      // We want the scroll logic to drive the active index
      // The section is tall (e.g. 400vh), so we map scroll position to index
      const start = top;
      const end = top + height - viewportHeight;
      const scrollY = -start; // How far we've scrolled into the component

      if (start <= 0 && end > 0) {
        const totalScrollableHeight = height - viewportHeight;
        const scrollProgress = Math.max(0, Math.min(1, scrollY / totalScrollableHeight));
        const index = Math.min(
          features.length - 1,
          Math.floor(scrollProgress * features.length)
        );
        setActiveFeature(index);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Init
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    // Outer container provides the scroll height (hold)
    <div ref={containerRef} className="relative w-full bg-[#13120b]" style={{ height: `${features.length * 80}vh` }}>

      {/* Sticky Viewport - This is the screen that stays "on hold" */}
      <div className="sticky top-0 w-full h-screen flex flex-col lg:flex-row overflow-hidden pt-16">

        {/* LEFT PANEL */}
        <div className="w-full lg:w-5/12 h-full p-8 md:p-16 flex flex-col justify-between border-r border-white/5 bg-[#13120b] relative z-10">
          {/* ... (Left Panel Content Unchanged) ... */}
          {/* Top Meta */}
          <div className="flex justify-between items-start">
            <div className="text-[10px] font-mono text-gray-500 tracking-widest uppercase">
              <div className="mb-2">No.</div>
              <div className="text-8xl md:text-9xl leading-[0.8] font-sans font-medium text-white/90 tracking-tighter">
                {String(activeFeature + 1).padStart(2, '0')}
              </div>
            </div>
            <div className="text-right hidden md:block">
              <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1">Architecture</div>
              <div className="text-[10px] font-mono text-white uppercase tracking-widest">
                v0.1.0 — Release
              </div>
            </div>
          </div>

          {/* Feature Visual */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full px-8 opacity-0 animate-[fadeIn_0.5s_ease-out_forwards] key={activeFeature}">
            <div className="transform scale-[0.65] sm:scale-75 md:scale-90 lg:scale-100 origin-center transition-transform duration-500">
              {features[activeFeature].visual}
            </div>
          </div>

          {/* Middle Details (Year/Category style from image) */}
          <div className="py-12 border-t border-white/10 border-b border-white/10 mt-auto mb-12 relative z-20 bg-[#13120b]/80 backdrop-blur-sm">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <span className="text-[10px] font-mono text-gray-600 uppercase block mb-2">Category</span>
                <span className="text-sm font-mono text-white block">{features[activeFeature].tags[0]}</span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-gray-600 uppercase block mb-2">Engine</span>
                <span className="text-sm font-mono text-white block">Python 3.10+</span>
              </div>
            </div>

            {/* Abstract Description */}
            <div className="mt-12">
              <p className="font-mono text-xs text-gray-400 leading-relaxed uppercase tracking-wide max-w-xs">
                {features[activeFeature].description}
              </p>
            </div>
          </div>

          {/* Bottom space filler or decoration since visual is removed */}
          <div className="hidden md:block">
            <div className="w-12 h-[1px] bg-white/20"></div>
          </div>
        </div>


        {/* RIGHT PANEL - The List */}
        <div className="w-full lg:w-7/12 h-full bg-[#13120b] flex flex-col justify-center px-8 md:px-20 pt-16 pb-0 relative">

          {/* Background Text Texture */}
          <div className="absolute top-10 right-10 text-right opacity-20 pointer-events-none">
            <div className="text-[10px] font-mono text-white">INDEPENDENT GUARDRAIL</div>
            <div className="text-[10px] font-mono text-white">LIBRARY FOR LLMS. OPEN</div>
            <div className="text-[10px] font-mono text-white">FOR NEW INTEGRATIONS.</div>
          </div>

          <div className="flex flex-col gap-0 md:gap-0.5">
            {features.map((feature, index) => (
              <div
                key={feature.id}
                className="group cursor-pointer transition-all duration-500 ease-in-out"
                onMouseEnter={() => setActiveFeature(index)}
              >
                <div className="flex items-baseline gap-4 md:gap-8">
                  {/* Small Number Label */}
                  <span className={`font-mono text-[10px] md:text-xs tracking-widest transition-colors duration-300 w-12 text-right ${index === activeFeature ? 'text-white' : 'text-zinc-700'
                    }`}>
                    NO-{String(feature.id).padStart(2, '0')}
                  </span>

                  {/* Title */}
                  <h3 className={`text-3xl md:text-4xl font-sans tracking-tight transition-all duration-300 ${index === activeFeature
                    ? 'text-white font-medium translate-x-2'
                    : 'text-zinc-800 hover:text-zinc-600 font-normal'
                    }`}>
                    {feature.title}
                  </h3>
                </div>

                {/* ExpandedContent */}
                <div className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] ${index === activeFeature ? 'max-h-[400px] opacity-100 mt-2 mb-2' : 'max-h-0 opacity-0'
                  }`}>
                  <div className="pl-16 md:pl-24 max-w-xl">
                    <div className="flex gap-8 mb-6 border-l border-white/10 pl-6">
                      <div className="flex-1">
                        <div className="text-[10px] text-zinc-500 uppercase mb-2 font-mono">Description</div>
                        <p className="text-zinc-400 font-mono text-xs leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                      <div className="flex-1 hidden md:block">
                        <div className="text-[10px] text-zinc-500 uppercase mb-2 font-mono">Dependencies</div>
                        <div className="flex flex-wrap gap-2">
                          {feature.tags.map(tag => (
                            <span key={tag} className="text-zinc-400 font-mono text-xs border-b border-zinc-800 pb-0.5">{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#1b1913] border border-white/10 p-4 rounded-xl font-mono text-[10px] relative group/code hover:border-white/20 transition-colors shadow-2xl">
                      <div className="absolute -top-2 left-4 px-2 bg-[#1b1913] text-zinc-500 text-[9px] uppercase tracking-wider border border-white/5 rounded">example.py</div>
                      <pre className="whitespace-pre-wrap text-[#E5E5E5]">{highlightCode(feature.code)}</pre>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Dots / Scroller indicator */}
          <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-2">
            {features.map((_, i) => (
              <div
                key={i}
                className={`w-1 h-1 rounded-full transition-all duration-300 ${i === activeFeature ? 'bg-white scale-150' : 'bg-zinc-800'}`}
              />
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default FeaturesScroll;