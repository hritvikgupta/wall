import React from 'react';
import { Link } from 'react-router-dom';
import { LandingHeroHeader } from './LandingHeroHeader';
import { LandingFooter } from './LandingFooter';
import { CheckCircle2, XCircle } from 'lucide-react';

const Landing: React.FC = () => {
  // Content from ProductDetail.tsx
  const content = {
    title: "LLM Wall",
    subtitle: "Enterprise Grade Guardrails",

    headline: "Total Control Over AI Responses",
    subdeck: "Define precise boundaries for your Large Language Models. Block hallucinations, PII leaks, and off-topic conversations before they reach your users.",
    intro: "As heavy reliance on LLMs grows, so does the risk of unpredictable outputs. LLM Wall provides the infrastructure to erect impenetrable guardrails around your models, ensuring they remain strictly within their defined operational context and never output what you don't want.",
    body1: "Acting as a deterministic firewall, LLM Wall intercepts every prompt and completion. It evaluates content against your custom-defined policies—checking for toxicity, competitor mentions, secrets, or specific banned topics—and blocks non-compliant responses instantly.",
    body2: "This is not just prompt engineering; it is a rigid defense system. By separating security logic from model logic, you guarantee that your AI adheres to safety protocols regardless of the underlying model's volatility or user attempts at jailbreaking.",
    specs: [
      { label: "Latency", value: "< 2ms" },
      { label: "Filtering", value: "99.9% Catch Rate" },
      { label: "Policies", value: "Custom Rules" },
      { label: "Integration", value: "Drop-in Middleware" }
    ]
  };

  const latestPost = {
    date: 'Jan 5, 2026',
    author: 'Team LLMWall',
    category: 'Engineering',
    title: 'The Architecture of Semantic Validation',
    excerpt: 'How we reduced latency by 40% while moving from keyword matching to full embedding-based semantic analysis for enterprise LLM guardrails.',
    imageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=2560&auto=format&fit=crop'
  };

  return (
    <div className="min-h-screen w-full flex justify-center bg-ns-paper py-8">
      <div className="w-full md:w-[85%] max-w-[1920px] bg-ns-paper text-ns-ink min-h-screen selection:bg-ns-ink selection:text-ns-paper font-body flex flex-col">

        <LandingHeroHeader title={content.title} subtitle={content.subtitle} />

        <div className="px-8 md:px-12 py-12">
          {/* Navigation Bar / Meta Info */}


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

            {/* LEFT COLUMN - Core Engine & Input */}
            <div className="space-y-12">

              {/* Introduction Paragraphs */}
              <div className="font-body text-ns-ink text-sm leading-relaxed text-justify">
                <p><span className="drop-cap">{content.body1.charAt(0)}</span>{content.body1.slice(1)}</p>
                <p className="mt-4">{content.body2}</p>
              </div>

              <div className="pt-8 border-t border-ns-ink">
                <h3 className="font-sans font-black text-2xl uppercase mb-6">I. The Defense Pipeline</h3>

                {/* Feature 1: Wall Guard (Docs Updated) */}
                <div className="mb-10">
                  <h4 className="font-sans font-bold text-sm uppercase tracking-widest mb-3">A. Wall Guard Engine</h4>
                  <p className="font-body text-sm leading-relaxed text-justify mb-4">
                    The heart of Wall Library. A multi-validator system that chains together multiple rules to check LLM inputs and outputs. Think of it as a firewall that sits between your LLM and your application, ensuring only safe, validated responses pass through.
                  </p>
                  <p className="font-body text-sm leading-relaxed text-justify mb-4 border-l-2 border-ns-ink/30 pl-4 italic bg-neutral-50 p-2">
                    <span className="font-bold not-italic font-sans text-xs uppercase block mb-1">Real-world Use Case:</span>
                    Consider a fintech application where an automated support agent handles sensitive transactions. The Wall Guard Engine acts as the primary defense layer, intercepting every user prompt before it reaches the core LLM. In this scenario, it simultaneously validates that the user is authenticated, the request (e.g., 'initiate refund') falls within the permissible action scope, and that no social engineering tactics are being used to bypass security protocols. If any validator in the chain flags a risk, the request is blocked instantly.
                  </p>
                  <div className="bg-ns-ink text-ns-paper border border-ns-ink p-4 relative group hover:bg-neutral-900 transition-colors">
                    <div className="absolute top-0 right-0 bg-ns-paper text-ns-ink text-[9px] font-mono px-2 py-1 uppercase">
                      Fig 1.0 - Middleware Init
                    </div>
                    <pre className="font-mono text-[10px] md:text-xs overflow-x-auto whitespace-pre-wrap pt-4 text-neutral-300">
                      {`from wall_library import WallGuard, OnFailAction

# Create guard with multiple validators
guard = WallGuard(name="security_layer").use(
    (HealthcareSafetyValidator, {"strict": True}, OnFailAction.EXCEPTION)
).use(
    (PIIValidator, {"mask_fields": ["ssn"]}, OnFailAction.FIX)
)

# Validate response
if result.validation_passed:
    return result.validated_output`}
                    </pre>
                  </div>
                </div>

                {/* Feature 2: Validators (Docs Updated) */}
                <div className="mb-10">
                  <h4 className="font-sans font-bold text-sm uppercase tracking-widest mb-3">B. Deterministic Validators</h4>
                  <p className="font-body text-sm leading-relaxed text-justify mb-4">
                    The building blocks of compliance. Create reusable validation rules to check responses against specific criteria—from simple regex patterns and JSON schemas to complex PII scrubbers. Register them once, use them anywhere.
                  </p>
                  <p className="font-body text-sm leading-relaxed text-justify mb-4 border-l-2 border-ns-ink/30 pl-4 italic bg-neutral-50 p-2">
                    <span className="font-bold not-italic font-sans text-xs uppercase block mb-1">Real-world Use Case:</span>
                    In a programmatic ad-buying assistant, reliability is non-negotiable. Deterministic Validators are deployed to police the output structure rigidly. For instance, a validator ensures that every bid recommendation is strictly formatted as a valid JSON object containing specific fields like 'bid_amount' and 'campaign_id'. Another validator scans the generated ad copy against a blacklist of prohibited keywords or competitor brand names. This ensures that even if the LLM hallucinates a creative but non-compliant response, the system catches the error before a single dollar is spent.
                  </p>
                  <div className="bg-ns-ink text-ns-paper border border-ns-ink p-4 relative group">
                    <div className="absolute top-0 right-0 bg-ns-paper text-ns-ink text-[9px] font-mono px-2 py-1 uppercase">
                      Fig 1.1 - Validator Stack
                    </div>
                    <pre className="font-mono text-[10px] md:text-xs overflow-x-auto whitespace-pre-wrap pt-4 text-neutral-300">
                      {`@register_validator("regex_match")
class RegexValidator(Validator):
    def _validate(self, value, metadata):
        if not self.pattern.match(value):
            return FailResult(
                error_message=f"Format mismatch: {value}",
                metadata={"pattern": self.pattern.pattern}
            )
        return PassResult()`}
                    </pre>
                  </div>
                </div>

                {/* Feature 3: Re-asking (Docs Updated) */}
                <div className="mb-10">
                  <h4 className="font-sans font-bold text-sm uppercase tracking-widest mb-3">C. Smart Re-asking</h4>
                  <p className="font-body text-sm leading-relaxed text-justify mb-4">
                    Don't just block—correct. When validation fails, the Re-asking mechanism provides feedback to the LLM, prompting it to self-correct. Configure <code>num_reasks</code> to automatically retry multiple times, ensuring valid outputs without user friction.
                  </p>
                  <p className="font-body text-sm leading-relaxed text-justify mb-4 border-l-2 border-ns-ink/30 pl-4 italic bg-neutral-50 p-2">
                    <span className="font-bold not-italic font-sans text-xs uppercase block mb-1">Real-world Use Case:</span>
                    Imagine a coding assistant integrated into an IDE. A user requests a Python function to parse a specific data format. The LLM generates the code, but the initial output fails a syntax validator or imports a deprecated library. Instead of returning a broken snippet to the user, the Re-asking mechanism captures the validation error and feeds it back to the LLM as a system prompt: "The previous code failed because library X is deprecated; please rewrite using library Y." The model self-corrects, and after a successful retry, the user receives the polished, working code without ever seeing the initial failure.
                  </p>
                  <div className="bg-ns-ink text-ns-paper border border-ns-ink p-4 relative group">
                    <div className="absolute top-0 right-0 bg-ns-paper text-ns-ink text-[9px] font-mono px-2 py-1 uppercase">
                      Fig 1.2 - Correction Logic
                    </div>
                    <pre className="font-mono text-[10px] md:text-xs overflow-x-auto whitespace-pre-wrap pt-4 text-neutral-300">
                      {`# Allow 2 retries with feedback
guard = WallGuard(num_reasks=2).use(
    (QualityValidator, {}, OnFailAction.REASK)
)

# 1. Validates output
# 2. If fail -> Sends error back to LLM context
# 3. Retries generation
# 4. Returns final safe response`}
                    </pre>
                  </div>
                </div>

                {/* Feature 4: NLP Scorer (Docs Updated to Context Manager) */}
                <div className="mb-10">
                  <h4 className="font-sans font-bold text-sm uppercase tracking-widest mb-3">D. Semantic NLP Scorer</h4>
                  <p className="font-body text-sm leading-relaxed text-justify mb-4">
                    Enforce precise domain boundaries. The Context Manager uses high-dimensional vector embeddings and cosine similarity to ensure LLM responses stay strictly within your approved topics (e.g., 'Healthcare Only'), effectively neutralizing jailbreaks and off-topic hallucinations.
                  </p>
                  <p className="font-body text-sm leading-relaxed text-justify mb-4 border-l-2 border-ns-ink/30 pl-4 italic bg-neutral-50 p-2">
                    <span className="font-bold not-italic font-sans text-xs uppercase block mb-1">Real-world Use Case:</span>
                    Deploying an internal HR policy bot for a large corporation requires strict adherence to topic boundaries. Employees might attempt to use the bot for unrelated tasks, such as generating code or seeking personal investment advice. The Semantic NLP Scorer analyzes the vector embedding of each incoming prompt. If an employee asks, "What stock should I buy?", the system calculates a low cosine similarity score against the authorized "HR & Benefits" context cluster. The request is immediately classified as off-topic and rejected, ensuring the bot remains a dedicated tool for company policy.
                  </p>
                  <div className="bg-ns-ink text-ns-paper border border-ns-ink p-4 relative group">
                    <div className="absolute top-0 right-0 bg-ns-paper text-ns-ink text-[9px] font-mono px-2 py-1 uppercase">
                      Fig 1.3 - Intent Analysis
                    </div>
                    <pre className="font-mono text-[10px] md:text-xs overflow-x-auto whitespace-pre-wrap pt-4 text-neutral-300">
                      {`from wall_library.nlp import ContextManager

# Define acceptable semantic boundaries
context_manager = ContextManager()
context_manager.add_string_list([
    "Medical diagnosis and treatment protocols", 
    "Patient health and safety guidelines"
])

# Validate response intent (0.0 - 1.0)
# Rejects if similarity < threshold (0.7)
is_safe = context_manager.check_context(
    response, 
    threshold=0.7
)`}
                    </pre>
                  </div>
                </div>

                {/* Feature 8 (H): Context Topology (Visual) */}
                <div className="mb-10">
                  <h4 className="font-sans font-bold text-sm uppercase tracking-widest mb-3">H. Context Topology</h4>
                  <p className="font-body text-sm leading-relaxed text-justify mb-4">
                    Visualizing the high-dimensional embedding space reveals how the specialized models cluster valid vs. invalid intents. The red clusters indicate blocked "jailbreak" attempts that fall outside the safe semantic manifold.
                  </p>
                  <div className="bg-ns-ink text-ns-paper border border-ns-ink p-4 relative group">
                    <div className="absolute top-0 right-0 bg-ns-paper text-ns-ink text-[9px] font-mono px-2 py-1 uppercase z-10">
                      Fig 1.7 - 3D Manifold
                    </div>
                    {/* Replaced CSS Plot with Generated Image */}
                    <div className="w-full aspect-[4/3] overflow-hidden border border-neutral-800">
                      <img src="/context_topology_plot.png" alt="3D Context Topology" className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </div>

                {/* Feature 10 (J): Latency Heatmap (Visual) */}
                <div className="mb-0">
                  <h4 className="font-sans font-bold text-sm uppercase tracking-widest mb-3">J. Latency Heatmap</h4>
                  <p className="font-body text-sm leading-relaxed text-justify mb-4">
                    Real-time performance distribution. The system aggressively optimizes for P99 latency &lt; 20ms. The heatmap visualization highlights outliers, allowing instant correlation between complex validation chains and processing spikes.
                  </p>
                  <div className="bg-ns-ink border border-ns-ink p-4 relative group">
                    <div className="absolute top-0 right-0 bg-ns-paper text-ns-ink text-[9px] font-mono px-2 py-1 uppercase z-10">
                      Fig 1.9 - P99 Distribution
                    </div>
                    {/* Replaced CSS Heatmap with Generated Image */}
                    <div className="w-full aspect-[2/1] overflow-hidden border border-neutral-800 mt-4">
                      <img src="/latency_heatmap_plot.png" alt="Latency Heatmap" className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* RIGHT COLUMN - Output & Observability */}
            <div className="space-y-12">

              <div className="pt-8 border-t border-ns-ink lg:border-t-0 lg:pt-0">

                {/* Feature 5: Vision Guard (Images, No change needed for bg) */}
                <div className="mb-10">
                  <h4 className="font-sans font-bold text-sm uppercase tracking-widest mb-3">E. Vision Guard</h4>
                  <p className="font-body text-sm leading-relaxed text-justify mb-4">
                    Multi-modal support is built-in. The Vision Guard scans uploaded images for NSFW content, text updates (OCR) that contain injections, or visuals that violate brand safety guidelines before they get to your vision-capable model.
                  </p>
                  <p className="font-body text-sm leading-relaxed text-justify mb-4 border-l-2 border-ns-ink/30 pl-4 italic bg-neutral-50 p-2">
                    <span className="font-bold not-italic font-sans text-xs uppercase block mb-1">Real-world Use Case:</span>
                    For a social media platform allowing users to generate AI-enhanced avatars from their photos, safety is paramount. The Vision Guard pipeline analyzes every uploaded reference image before it enters the processing queue. It employs a multi-stage check: first scanning for NSFW or violent imagery to protect the brand, and simultaneously running OCR to detect if the image contains visible PII like credit card numbers or physical addresses. If a driver's license is detected, the pipeline blocks the upload instantly, preventing the AI from inadvertently learning from private user data.
                  </p>

                  <div className="border border-ns-ink p-3 bg-white relative">
                    <div className="absolute top-0 right-0 bg-ns-ink text-ns-paper text-[9px] font-mono px-2 py-1 uppercase">
                      Fig 1.4 - Visual Filter
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      {/* Valid Image */}
                      <div className="border border-green-600/30 bg-green-50 p-2">
                        <span className="font-mono text-[9px] font-bold text-green-700 uppercase block mb-1">Pass: Workplace Safe</span>
                        <div className="w-full aspect-[9/16] overflow-hidden mb-1 border border-green-200">
                          <img src="/vision_safe.png" alt="Valid Office Environment" className="w-full h-full object-cover" />
                        </div>
                      </div>
                      {/* Invalid Image */}
                      <div className="border border-red-600/30 bg-red-50 p-2">
                        <span className="font-mono text-[9px] font-bold text-red-700 uppercase block mb-1">Block: NSFW Content</span>
                        <div className="w-full aspect-[9/16] overflow-hidden mb-1 border border-red-200 relative">
                          <img src="/vision_unsafe.png" alt="Blocked Content" className="w-full h-full object-cover blur-md scale-110" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-widest -rotate-12 border border-white">
                              BLOCKED
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Feature 6: Response Scorer (Already Dark, check text color) */}
                <div className="mb-10">
                  <h4 className="font-sans font-bold text-sm uppercase tracking-widest mb-3">F. Response Consistency</h4>
                  <p className="font-body text-sm leading-relaxed text-justify mb-4">
                    Ensures the model is telling the truth. By comparing the generated response against your retrieved context (RAG) using BLEU and ROUGE metrics, we intercept "hallucinations" where the model invents facts not present in the source data.
                  </p>
                  <p className="font-body text-sm leading-relaxed text-justify mb-4 border-l-2 border-ns-ink/30 pl-4 italic bg-neutral-50 p-2">
                    <span className="font-bold not-italic font-sans text-xs uppercase block mb-1">Real-world Use Case:</span>
                    In a legal tech application that summarizes court case documents, accuracy is critical. A "hallucinated" precedent could have disastrous consequences. The Response Consistency module runs a post-generation verification by comparing the LLM's summary directly against the source text chunks used for the prompt. It calculates semantic overlap and factual density. If the LLM generates a claim like "The defendant was acquitted" but the source text says "found guilty", the consistency score drops below the threshold, and the system flags the response as a hallucination error.
                  </p>
                  <div className="bg-ns-ink text-ns-paper border border-ns-ink p-4 relative group">
                    <div className="absolute top-0 right-0 bg-ns-paper text-ns-ink text-[9px] font-mono px-2 py-1 uppercase">
                      Fig 1.5 - Hallucination Check
                    </div>
                    <pre className="font-mono text-[10px] md:text-xs overflow-x-auto whitespace-pre-wrap pt-4 text-neutral-300">
                      {`from wall_library.scoring import ResponseScorer, BLEUMetric

# Initialize scorer with strict thresholds
scorer = ResponseScorer(threshold=0.8)
scorer.metrics.append(BLEUMetric())

# Score response against retrieved context (RAG)
scores = scorer.score(response, context)

# Block if hallucination detected
if scores['BLEUMetric'] < 0.4:
    raise HallucinationError("Response deviates from context")`}
                    </pre>
                  </div>
                </div>

                {/* Feature 7: LLM Monitor (Updated to Dark) */}
                <div className="mb-10">
                  <h4 className="font-sans font-bold text-sm uppercase tracking-widest mb-3">G. Observability & Logs</h4>
                  <p className="font-body text-sm leading-relaxed text-justify mb-4">
                    Security requires visibility. The Monitor module logs every prompt, verdict, latency metric, and token count. Integrate with Datadog, Prometheus, or use our built-in dashboard to audit attacks and refine your rule sets.
                  </p>
                  <p className="font-body text-sm leading-relaxed text-justify mb-4 border-l-2 border-ns-ink/30 pl-4 italic bg-neutral-50 p-2">
                    <span className="font-bold not-italic font-sans text-xs uppercase block mb-1">Real-world Use Case:</span>
                    For a banking institution deploying an AI financial advisor, every interaction must be defensible in an audit. The Observability module provides a comprehensive "black box" recorder for the AI. It logs the raw user prompt, the retrieved context data, the model's intermediate reasoning, the validation verdicts, and the final output latency. If a customer later claims the AI gave bad advice, the bank can query these logs to reconstruct the exact session state, proving that the advice was either compliant with regulations or that the user's risky prompt was correctly blocked.
                  </p>
                  <div className="bg-ns-ink text-ns-paper border border-ns-ink p-4 relative group">
                    <div className="absolute top-0 right-0 bg-ns-paper text-ns-ink text-[9px] font-mono px-2 py-1 uppercase">
                      Fig 1.6 - Audit Log
                    </div>
                    <pre className="font-mono text-[10px] md:text-xs overflow-x-auto whitespace-pre-wrap pt-4 text-neutral-300">
                      {`from wall_library.monitoring import LLMMonitor

# Enable full telemetry & logging
monitor = LLMMonitor(enable_telemetry=True)

# Track every interaction for audit
monitor.track_call(
    input_data=prompt,
    output=response,
    metadata={
        "model": "gpt-4",
        "risk_score": 0.12,
        "compliance_check": "passed",
        "latency_ms": 42
    }
)`}
                    </pre>
                  </div>
                </div>

                {/* Feature 9 (I): Quality Metrics (Visual) */}
                <div className="mb-10">
                  <h4 className="font-sans font-bold text-sm uppercase tracking-widest mb-3">I. Quality Metrics</h4>
                  <p className="font-body text-sm leading-relaxed text-justify mb-4">
                    Comparative evaluation of model outputs. We benchmark every generated token against ROUGE (recall), BLEU (precision), and semantic similarity targets. This guarantees your LLM maintains 'Human-Expert' level quality even under high load.
                  </p>
                  <div className="bg-ns-ink text-ns-paper border border-ns-ink p-4 relative group">
                    <div className="absolute top-0 right-0 bg-ns-paper text-ns-ink text-[9px] font-mono px-2 py-1 uppercase scale-90 sm:scale-100 origin-top-right">
                      Fig 1.8 - Quality Benchmarks
                    </div>
                    {/* Replaced CSS Bars with Generated Image */}
                    <div className="w-full aspect-[3/2] overflow-hidden border border-neutral-800 mt-6">
                      <img src="/quality_metrics_plot.png" alt="Quality Metrics Bar Chart" className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </div>

              </div>

              {/* Field Applications & Specs (Existing) */}
              <div className="pt-8 border-t-2 border-ns-ink">
                <h3 className="font-sans font-black text-2xl uppercase mb-4">II. Field Applications</h3>
                <p className="font-body text-sm leading-relaxed text-justify mb-6">
                  The architecture is domain-agnostic but comes with pre-configured validation sets for high-risk industries.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { title: "Healthcare", desc: "Blocks dangerous claims, validates patient data." },
                    { title: "Finance", desc: "Prevents guaranteed returns, enforces compliance." },
                    { title: "Legal", desc: "Prevents unauthorized advice, ensures disclaimers." },
                    { title: "E-commerce", desc: "Blocks false product claims, ensures pricing." }
                  ].map((domain, idx) => (
                    <div key={idx} className="bg-white border border-ns-ink p-3 hover:bg-neutral-200 transition-colors">
                      <h4 className="font-sans font-bold text-[10px] uppercase tracking-widest mb-1">{domain.title}</h4>
                      <p className="font-mono text-[10px] leading-tight opacity-80">{domain.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Specifications Table */}
              <div className="border-t-4 border-ns-ink pt-2 mt-8">
                <h3 className="font-sans font-black text-xl uppercase mb-4">Specs</h3>
                <dl className="grid grid-cols-1 gap-0 border-2 border-ns-ink">
                  {content.specs.map((spec, i) => (
                    <div key={i} className="flex justify-between items-center p-3 border-b border-ns-ink last:border-b-0 bg-white hover:bg-neutral-50 transition-colors">
                      <dt className="font-sans text-[10px] font-bold uppercase tracking-widest opacity-70">{spec.label}</dt>
                      <dd className="font-mono text-xs font-bold">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

            </div>

          </div>

          {/* Latest Updates / Blog (Adapted) */}
          <div className="mt-16 border-t-2 border-ns-ink pt-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center border border-ns-ink bg-white p-6 relative group">
              <div className="absolute top-0 right-0 bg-ns-ink text-ns-paper text-[9px] font-mono px-2 py-1 uppercase">
                Appendix A. Recent Findings
              </div>
              <div className="md:col-span-4 aspect-video md:aspect-square bg-neutral-200 overflow-hidden border border-ns-ink grayscale contrast-125">
                <img src={latestPost.imageUrl} alt="Blog Cover" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              </div>
              <div className="md:col-span-8 space-y-4">
                <div className="font-mono text-[10px] uppercase tracking-widest opacity-60">
                  {latestPost.date} | {latestPost.category} | {latestPost.author}
                </div>
                <h3 className="font-serif font-bold text-3xl md:text-4xl leading-none">
                  {latestPost.title}
                </h3>
                <p className="font-body text-sm leading-relaxed opacity-80 max-w-2xl">
                  {latestPost.excerpt}
                </p>
                <Link to="/blog/semantic-validation" className="inline-block mt-4 font-sans font-bold text-xs uppercase border-b border-ns-ink pb-1 hover:pb-2 transition-all">
                  Read Full Paper →
                </Link>
              </div>
            </div>
          </div>

          {/* BOTTOM CTA */}
          <div className="mt-16 bg-ns-ink text-ns-paper p-8 md:p-12 border-t-4 border-double border-ns-paper outline outline-4 outline-ns-ink -mx-4 md:-mx-6 relative overflow-hidden">
            {/* Texture overlay for the dark card */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="font-sans font-black text-5xl md:text-7xl leading-[0.85] tracking-tighter mb-6">
                  Prompt.<br />Guard.<br />Deploy.
                </h2>
                <p className="font-mono text-xs md:text-sm leading-relaxed opacity-80 max-w-md mb-8">
                  Upgrade your LLM stack. Integrate validation processes to encourage deterministic outputs and increase quality.
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <div className="bg-ns-paper text-ns-ink p-4 font-mono text-xs flex items-center justify-between group cursor-pointer hover:bg-white transition-colors" onClick={() => navigator.clipboard.writeText('pip install wall-library')}>
                  <span>{'>_ pip install wall-library'}</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity uppercase text-[10px] font-bold">Copy</span>
                </div>
                <a href="https://test.pypi.org/project/wall-library/0.1.1/" target="_blank" rel="noopener noreferrer" className="border border-ns-paper/30 hover:bg-ns-paper/10 text-ns-paper p-4 font-mono text-xs flex items-center justify-center gap-2 uppercase tracking-widest transition-colors">
                  View on PyPI
                </a>
                <Link to="/documentation" className="border border-ns-paper/30 hover:bg-ns-paper/10 text-ns-paper p-4 font-mono text-xs flex items-center justify-center gap-2 uppercase tracking-widest transition-colors">
                  Read Documentation
                </Link>
              </div>
            </div>
          </div>

        </div>

        <LandingFooter />
      </div>
    </div>
  );
};

export default Landing;
