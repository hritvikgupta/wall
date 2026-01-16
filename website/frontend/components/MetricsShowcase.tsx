import React from 'react';
import CodeCard from './CodeCard';

const scoringExamples = [
  {
    title: "High Quality Response",
    subtitle: "Score: 0.89",
    code: `scorer.eval(
  response, 
  reference
)`,
    input: `Resp: "Common symptoms include thirst, fatigue..."
Ref: "Diabetes symptoms include thirst, fatigue..."`,
    output: `✅ HIGH QUALITY
Cosine: 0.92 | ROUGE: 0.88
BLEU: 0.85   | Semantic: 0.90`,
    isFail: false
  },
  {
    title: "Low Quality Response",
    subtitle: "Score: 0.30",
    code: `scorer.eval(
  response, 
  reference
)`,
    input: `Resp: "Diabetes has symptoms."
Ref: "Diabetes symptoms include thirst, fatigue..."`,
    output: `❌ LOW QUALITY
Cosine: 0.35 | ROUGE: 0.25
BLEU: 0.20   | Semantic: 0.40`,
    isFail: true
  },
  {
    title: "Medium Quality",
    subtitle: "Score: 0.61",
    code: `scorer.eval(
  response, 
  reference
)`,
    input: `Resp: "Symptoms include thirst and urination."
Ref: "Diabetes symptoms include thirst, fatigue..."`,
    output: `⚠️ ACCEPTABLE
Cosine: 0.68 | ROUGE: 0.55
BLEU: 0.52   | Semantic: 0.70`,
    isFail: false
  },
  {
    title: "Context Verification",
    subtitle: "Score: 0.95",
    code: `scorer.verify_context(
  response, 
  context_docs
)`,
    input: `Resp: "Consult a healthcare provider."
Context: "Seek medical advice for diagnosis."`,
    output: `✅ GROUNDED
Entailment Score: 0.95
Hallucination: None detected`,
    isFail: false
  }
];

const MetricsShowcase: React.FC = () => {
  return (
    <div className="py-24 border-t border-white/5 overflow-visible">
      <div className="mb-12 px-1">
        <div className="font-mono text-xs text-blue-500 tracking-widest uppercase mb-4">
          04 / Quality Assurance
        </div>
        <h2 className="text-3xl md:text-4xl font-mono font-bold text-white tracking-tight">
          Response Scorer
        </h2>
        <p className="mt-4 text-muted font-mono text-sm max-w-2xl leading-relaxed">
          Scores response quality using multiple metrics including ROUGE, BLEU, and Semantic Similarity.
          Ensures responses meet high standards for accuracy and completeness across Healthcare, Education, and other domains.
        </p>
      </div>

      {/* Scroll Container */}
      <div className="w-full overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
        <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
          {/* Set 1 */}
          <div className="flex gap-6 mx-3 pb-24">
            {scoringExamples.map((item, idx) => (
              <div key={`a-${idx}`} className="w-[350px]">
                <CodeCard {...item} />
              </div>
            ))}
          </div>

          {/* Set 2 (Duplicate) */}
          <div className="flex gap-6 mx-3 pb-24">
            {scoringExamples.map((item, idx) => (
              <div key={`b-${idx}`} className="w-[350px]">
                <CodeCard {...item} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsShowcase;