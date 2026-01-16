import React from 'react';
import { Header } from './Header';

interface ProductDetailProps {
  productId: string;
  onBack: () => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ productId, onBack }) => {
  const isWall = productId === 'llm-wall';
  
  const content = isWall ? {
    title: "LLM Wall",
    subtitle: "Perimeter Defense Protocol",
    figCaption: "Fig 2A. The Barrier [Online]",
    headline: "The Firewall for Cognition",
    subdeck: "Standardizing the defense mechanisms of large language models against adversarial attacks",
    intro: "In the rapidly expanding frontier of artificial intelligence, the security of cognitive architectures has become paramount. LLM Wall represents the first line of defense, a sophisticated perimeter system designed to intercept and neutralize malicious inputs before they can interact with the core model.",
    body1: "Utilizing advanced vector sanitization techniques, LLM Wall analyzes incoming prompt streams for semantic anomalies characteristic of injection attacks. It operates with negligible latency, ensuring that the conversational flow remains uninterrupted while rigorously filtering for 'jailbreak' patterns and social engineering attempts.",
    body2: "The system creates an isolation layer, effectively air-gapping the model's instruction set from user inputs. This architectural separation prevents context contamination and ensures that the model's alignment parameters remain inviolate, even under sustained adversarial pressure.",
    specs: [
      { label: "Latency", value: "< 5ms" },
      { label: "Throughput", value: "10k TPS" },
      { label: "Validators", value: "7 Active" },
      { label: "Protocol", value: "gRPC / REST" }
    ]
  } : {
    title: "Chytr",
    subtitle: "Adaptive Immune System",
    figCaption: "Fig 2B. The Organism [Evolving]",
    headline: "Biological Defense Protocols",
    subdeck: "A self-evolving heuristic engine that learns from every interaction across the neural network",
    intro: "Traditional static defenses are insufficient against the polymorphic nature of modern AI threats. Chytr draws inspiration from biological immune systems, deploying autonomous agents that permeate the network infrastructure to detect and respond to anomalies in real-time.",
    body1: "Chytr functions as a decentralized nervous system for your AI stack. It continuously monitors output tensors for signs of hallucination, bias drift, or data leakage. When a threat is detected, it does not merely block it; it analyzes the attack vector and instantly propagates updated defense signatures to all nodes in the cluster.",
    body2: "This adaptive capability allows Chytr to defend against zero-day exploits that have no known signature. By modeling the 'health' of the model's reasoning process, it can identify subtle deviations that indicate manipulation, ensuring the reliability of mission-critical AI applications.",
    specs: [
      { label: "Adaptation Rate", value: "Real-time" },
      { label: "Coverage", value: "100% Nodes" },
      { label: "Model Agnostic", value: "Yes" },
      { label: "Overhead", value: "~0.4%" }
    ]
  };

  return (
    <>
      <Header title={content.title} subtitle={content.subtitle} figCaption={content.figCaption} />
      
      <div className="px-8 md:px-12 pb-12">
        {/* Navigation Bar */}
        <div className="py-4 border-b border-ns-ink mb-8 flex justify-between items-center">
            <button 
                onClick={onBack}
                className="font-mono text-xs uppercase tracking-widest hover:bg-ns-ink hover:text-ns-paper px-2 py-1 -ml-2 transition-colors flex items-center gap-2"
            >
                ← Return to Index
            </button>
            <span className="font-mono text-[10px] uppercase opacity-60">
                Document Ref: {isWall ? 'SEC-8821' : 'BIO-9942'}
            </span>
        </div>

        {/* Abstract / Hero Section (Full Width) */}
        <div className="mb-12 border-b-2 border-ns-ink pb-8">
             <h2 className="font-serif font-black text-5xl md:text-7xl uppercase leading-none mb-6 text-center">
                {content.headline}
             </h2>
             <div className="flex justify-center mb-8">
                <p className="font-sans font-bold text-sm md:text-lg uppercase tracking-widest leading-relaxed text-ns-ink/80 max-w-3xl text-center">
                    {content.subdeck}
                </p>
             </div>
             <p className="font-body text-sm md:text-base leading-relaxed text-justify max-w-4xl mx-auto px-4 md:px-0">
                <span className="font-bold font-sans text-xs uppercase mr-2">[Abstract]</span>
                {content.intro}
             </p>
        </div>

        {/* 2-Column Research Paper Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* LEFT COLUMN */}
            <div className="space-y-8">
                {/* Introduction Paragraphs */}
                <div className="font-body text-ns-ink text-sm leading-relaxed text-justify">
                    <p><span className="drop-cap">{content.body1.charAt(0)}</span>{content.body1.slice(1)}</p>
                    <p className="mt-4">{content.body2}</p>
                </div>

                {/* LLM Wall Specific Content - Left Col */}
                {isWall && (
                    <>
                        <div className="pt-8 border-t border-ns-ink">
                            <h3 className="font-sans font-black text-2xl uppercase mb-2">I. The Wall Guard Engine</h3>
                            <p className="font-body text-sm leading-relaxed text-justify mt-4">
                                The central validation engine orchestrates sequential validator execution. It acts as a secure middleware between your LLM and the user, ensuring that no raw input reaches the model without passing through a series of rigorous checks.
                            </p>
                        </div>

                        {/* Subsection A: Input Validation */}
                        <div>
                            <h4 className="font-sans font-bold text-sm uppercase tracking-widest mb-3">A. Input/Output Validation</h4>
                            <p className="font-body text-sm leading-relaxed text-justify mb-4">
                                The primary gatekeeper. We enforce strict schema adherence and keyword blacklisting to prevent low-level prompt injections. This module scans for restricted terms, PII patterns, and known adversarial prefixes.
                            </p>
                            
                            {/* Code Snippet: WallGuard Init */}
                            <div className="bg-neutral-100 border border-ns-ink p-4 relative group">
                                <div className="absolute top-0 right-0 bg-ns-ink text-ns-paper text-[9px] font-mono px-2 py-1 uppercase">
                                    Fig 1.0 - Core Initialization
                                </div>
                                <pre className="font-mono text-[10px] md:text-xs overflow-x-auto whitespace-pre-wrap pt-4">
{`const guard = new WallGuard({
  strategy: 'block',
  fallback: 'Request denied.'
});

// Middleware Implementation
app.use(async (req, res, next) => {
  const verdict = await guard.validate(req.body.prompt);
  if (verdict.blocked) {
    return res.status(403).json({ error: verdict.reason });
  }
  next();
});`}
                                </pre>
                            </div>
                        </div>

                        {/* Subsection B: NLP Scorer */}
                        <div>
                             <h4 className="font-sans font-bold text-sm uppercase tracking-widest mb-3">B. NLP Scorer & Context</h4>
                             <p className="font-body text-sm leading-relaxed text-justify mb-4">
                                A semantic analysis engine that evaluates the intent behind a prompt. Unlike simple keyword matching, the NLP Scorer uses a lightweight transformer model to detect "jailbreak" attempts where the user tries to trick the model into bypassing its safety guidelines through roleplay or logical paradoxes.
                             </p>

                             {/* Code Snippet: Domain Config */}
                             <div className="bg-ns-ink text-ns-paper border border-ns-ink p-4 relative group">
                                <div className="absolute top-0 right-0 bg-ns-paper text-ns-ink text-[9px] font-mono px-2 py-1 uppercase">
                                    Fig 1.1 - Domain Config
                                </div>
                                <pre className="font-mono text-[10px] md:text-xs overflow-x-auto whitespace-pre-wrap pt-4 text-neutral-300">
{`def create_healthcare_wall(persist_directory: str = None):
    # ==========================================
    # 1. GUARD - Input/Output Validation
    # ==========================================
    guard = WallGuard()

    # Add safety validator (blocks restricted terms)
    guard.use((
        HealthcareSafetyValidator,
        {"restricted_terms": HEALTHCARE_RESTRICTED_TERMS},
        OnFailAction.EXCEPTION
    ))
    
    return guard`}
                                </pre>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-8">
                
                {isWall ? (
                    <>
                        {/* Subsection C: Response Scorer */}
                        <div>
                            <h4 className="font-sans font-bold text-sm uppercase tracking-widest mb-3">C. Response Scorer</h4>
                            <p className="font-body text-sm leading-relaxed text-justify mb-4">
                                Quality assurance for the model's output. We utilize deterministic metrics like ROUGE and BLEU, alongside semantic similarity scores, to ensure the generated response is grounded in the provided context and hallucinates minimal information.
                            </p>

                            {/* Code Snippet: Scorer Eval */}
                            <div className="bg-neutral-100 border border-ns-ink p-4 relative group mb-4">
                                <div className="absolute top-0 right-0 bg-ns-ink text-ns-paper text-[9px] font-mono px-2 py-1 uppercase">
                                    Fig 1.2 - Quality Assurance
                                </div>
                                <pre className="font-mono text-[10px] md:text-xs overflow-x-auto whitespace-pre-wrap pt-4">
{`# Evaluate response quality
metrics = scorer.eval(
    response=llm_output,
    reference=ground_truth_context
)

if metrics['rouge_l'] < 0.5:
    raise LowQualityResponseError("Hallucination detected")

# Output:
# {
#   "cosine": 0.92,
#   "rouge": 0.88,
#   "bleu": 0.85
# }`}
                                </pre>
                            </div>

                            {/* Visuals for QA */}
                            <div className="border border-ns-ink p-4 bg-white">
                                <h5 className="font-sans font-bold text-[10px] uppercase tracking-widest mb-4 border-b border-ns-ink pb-2">Visualization</h5>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></div>
                                        <div className="flex-1 border border-ns-ink p-2 bg-neutral-50">
                                            <div className="font-mono text-[9px] uppercase text-red-600 mb-1">Warning: Low Fidelity</div>
                                            <div className="font-mono text-[9px]">Cosine: 0.68 | ROUGE: 0.55</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-green-600"></div>
                                        <div className="flex-1 border border-ns-ink p-2 bg-ns-ink text-ns-paper">
                                            <div className="font-mono text-[9px] uppercase text-green-400 mb-1">Verified: High Quality</div>
                                            <div className="font-mono text-[9px]">Cosine: 0.92 | ROUGE: 0.88</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section II: Field Applications */}
                        <div className="pt-8 border-t border-ns-ink">
                             <h3 className="font-sans font-black text-2xl uppercase mb-4">II. Field Applications</h3>
                             <p className="font-body text-sm leading-relaxed text-justify mb-6">
                                The architecture is domain-agnostic but comes with pre-configured validation sets for high-risk industries. From HIPAA-compliant healthcare validators to FINRA-aligned financial guardrails.
                             </p>
                             <div className="grid grid-cols-2 gap-4">
                                {[
                                    { title: "Healthcare", desc: "Blocks dangerous claims, validates patient data." },
                                    { title: "Finance", desc: "Prevents guaranteed returns, enforces compliance." },
                                    { title: "Legal", desc: "Prevents unauthorized advice, ensures disclaimers." },
                                    { title: "E-commerce", desc: "Blocks false product claims, ensures pricing." },
                                    { title: "Education", desc: "Scores against curriculum standards." },
                                    { title: "Support", desc: "Enforces policy accuracy, maintains brand voice." }
                                ].map((domain, idx) => (
                                    <div key={idx} className="bg-ns-paper border border-ns-ink p-3 hover:bg-neutral-200 transition-colors">
                                        <h4 className="font-sans font-bold text-[10px] uppercase tracking-widest mb-1">{domain.title}</h4>
                                        <p className="text-[10px] leading-tight opacity-80">{domain.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                         {/* Specifications Table */}
                        <div className="border-t-4 border-ns-ink pt-2 mt-8">
                            <h3 className="font-sans font-black text-xl uppercase mb-4">Specifications</h3>
                            <dl className="grid grid-cols-1 gap-0 border-2 border-ns-ink">
                                {content.specs.map((spec, i) => (
                                    <div key={i} className="flex justify-between items-center p-3 border-b border-ns-ink last:border-b-0 bg-white hover:bg-neutral-50 transition-colors">
                                        <dt className="font-sans text-[10px] font-bold uppercase tracking-widest opacity-70">{spec.label}</dt>
                                        <dd className="font-mono text-xs font-bold">{spec.value}</dd>
                                    </div>
                                ))}
                            </dl>
                        </div>
                    </>
                ) : (
                    // Right column for Chytr or generic pages
                    <div className="space-y-8">
                         <div className="border-t-4 border-ns-ink pt-2">
                            <h3 className="font-sans font-black text-xl uppercase mb-4">Specifications</h3>
                            <dl className="grid grid-cols-1 gap-0 border-2 border-ns-ink">
                                {content.specs.map((spec, i) => (
                                    <div key={i} className="flex justify-between items-center p-3 border-b border-ns-ink last:border-b-0 bg-white hover:bg-neutral-50 transition-colors">
                                        <dt className="font-sans text-[10px] font-bold uppercase tracking-widest opacity-70">{spec.label}</dt>
                                        <dd className="font-mono text-xs font-bold">{spec.value}</dd>
                                    </div>
                                ))}
                            </dl>
                        </div>
                         <div className="bg-ns-ink text-ns-paper p-6 text-center">
                            <p className="font-serif italic mb-4">"The only secure system is one that assumes it is already compromised."</p>
                            <button className="w-full bg-ns-paper text-ns-ink font-sans font-bold text-xs uppercase py-3 hover:bg-neutral-300 transition-colors">
                                Request Access
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* BOTTOM CTA FOR LLM WALL */}
        {isWall && (
             <div className="mt-16 bg-ns-ink text-ns-paper p-8 md:p-12 border-t-4 border-double border-ns-paper outline outline-4 outline-ns-ink -mx-4 md:-mx-6 relative overflow-hidden">
                {/* Texture overlay for the dark card */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
                
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div>
                        <h2 className="font-sans font-black text-5xl md:text-7xl leading-[0.85] tracking-tighter mb-6">
                            Prompt.<br/>Guard.<br/>Deploy.
                        </h2>
                        <p className="font-mono text-xs md:text-sm leading-relaxed opacity-80 max-w-md mb-8">
                            Upgrade your LLM stack. Integrate validation processes to encourage deterministic outputs and increase quality.
                        </p>
                    </div>
                    <div className="flex flex-col gap-4">
                        <div className="bg-ns-paper text-ns-ink p-4 font-mono text-xs flex items-center justify-between group cursor-pointer hover:bg-white transition-colors">
                            <span>{'>_ pip install wall-library'}</span>
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity uppercase text-[10px] font-bold">Copy</span>
                        </div>
                        <button className="border border-ns-paper/30 hover:bg-ns-paper/10 text-ns-paper p-4 font-mono text-xs flex items-center justify-center gap-2 uppercase tracking-widest transition-colors">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                            View on PyPI
                        </button>
                    </div>
                </div>
            </div>
        )}

      </div>
    </>
  );
};