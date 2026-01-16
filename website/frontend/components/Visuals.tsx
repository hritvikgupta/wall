import React from 'react';
import {
  Shield,
  Zap,
  Brain,
  Activity,
  Search,
  FileCheck,
  AlertCircle,
  CheckCircle2,
  Lock,
  Code2,
  Database,
  Filter,
  RefreshCw,
  GitMerge,
  Terminal,
  BarChart3
} from 'lucide-react';

// --- Shared UI Components ---

const Container = ({ children, className = "" }: { children?: React.ReactNode, className?: string }) => (
  <div className={`w-full h-[450px] relative bg-[#050505] rounded-3xl border border-white/10 overflow-hidden shadow-2xl dot-pattern flex items-center justify-center p-8 ${className}`}>
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 pointer-events-none"></div>
    {children}
  </div>
);

const NodeCard = ({ icon: Icon, label, subLabel, active = false, gradient = false }: any) => (
  <div className={`
    relative flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border transition-all duration-500 z-10 w-32 h-32
    ${gradient
      ? 'moving-gradient-bg border-transparent shadow-[0_0_30px_rgba(59,130,246,0.3)] text-white'
      : 'glass-card text-muted hover:border-white/20 bg-[#0a0a0a]/90'
    }
    ${active && !gradient ? 'border-blue-500/50 text-white shadow-[0_0_15px_rgba(59,130,246,0.15)]' : ''}
  `}>
    {gradient && <div className="absolute inset-[1px] bg-[#111] rounded-[14px] z-0"></div>}

    <div className={`relative z-10 p-2 rounded-xl ${gradient ? 'bg-white/10' : 'bg-white/5'}`}>
      <Icon className={`w-8 h-8 ${gradient ? 'text-white' : active ? 'text-blue-400' : 'text-gray-500'}`} />
    </div>
    <div className="relative z-10 flex flex-col items-center">
      <span className={`text-xs font-mono font-bold tracking-wide uppercase text-center ${gradient ? 'text-white' : ''}`}>{label}</span>
      {subLabel && <span className="text-[9px] font-mono text-gray-500 mt-1">{subLabel}</span>}
    </div>
  </div>
);

const ConnectionLine = ({ active = false, vertical = false, length = "flex-1" }: any) => (
  <div className={`${vertical ? `w-px ${length} flex-col` : `h-px ${length} flex-row`} relative bg-white/10 flex items-center justify-center overflow-hidden`}>
    {active && (
      <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-80 ${vertical ? 'animate-[flowDown_2s_linear_infinite] h-[200%] w-full' : 'animate-[flowRight_2s_linear_infinite] w-[200%] h-full'}`}></div>
    )}
    {!active && <div className="w-1.5 h-1.5 rounded-full bg-[#333]"></div>}
  </div>
);

// --- Feature Visualizations ---

// 1. Wall Guard Visual - Pipeline Architecture
export const WallGuardVisual = () => (
  <Container>
    <div className="flex items-center gap-4 w-full max-w-4xl relative z-10 px-4">
      {/* Input */}
      <NodeCard icon={Code2} label="LLM Stream" subLabel="Raw Tokens" />

      <ConnectionLine active />

      {/* Central Engine */}
      <div className="relative p-[1px] rounded-3xl overflow-hidden moving-gradient-bg shadow-2xl w-[320px] shrink-0">
        <div className="bg-[#0f0f0f] rounded-[23px] p-6 flex flex-col gap-4 relative z-10 h-full">
          <div className="flex items-center gap-3 border-b border-white/10 pb-3 mb-1">
            <Shield className="w-5 h-5 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400" />
            <span className="font-mono font-bold text-white text-sm">Wall Guard Engine</span>
          </div>

          {/* Sequential Steps */}
          <div className="space-y-3">
            {[
              { l: "Sanitizer", i: Filter, c: "text-blue-400" },
              { l: "Validators", i: Lock, c: "text-purple-400" },
              { l: "Scorer", i: Activity, c: "text-pink-400" }
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                <s.i className={`w-4 h-4 ${s.c}`} />
                <span className="text-xs font-mono text-gray-300 flex-1">{s.l}</span>
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500/30"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500/10"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ConnectionLine active />

      {/* Output */}
      <NodeCard icon={CheckCircle2} label="Safe Output" subLabel="Verified" active />
    </div>
  </Container>
);

// 2. Validators Visual - Registry Grid
export const ValidatorsVisual = () => (
  <Container>
    <div className="flex flex-col h-full w-full p-4">
      <div className="flex justify-between items-center mb-8 px-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <Database className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h4 className="font-mono font-bold text-white text-sm">Validator Registry</h4>
            <p className="text-[10px] font-mono text-muted">Active Ruleset v0.1.0</p>
          </div>
        </div>
        <div className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-mono font-bold">
          SYSTEM ACTIVE
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 h-full">
        {[
          { name: 'PII Shield', icon: Lock, status: 'Active', desc: 'Redacts emails, phones, SSNs' },
          { name: 'Toxicity', icon: AlertCircle, status: 'Active', desc: 'Detects hate speech, insults' },
          { name: 'JSON Guard', icon: Code2, status: 'Active', desc: 'Enforces schema compliance' },
          { name: 'Regex', icon: Search, status: 'Custom', desc: 'Matches custom patterns' },
          { name: 'Gibberish', icon: Activity, status: 'Active', desc: 'Filters low-quality text' },
          { name: 'Competitor', icon: Shield, status: 'Ready', desc: 'Blocks brand mentions' },
        ].map((v, i) => (
          <div key={i} className="group relative bg-[#0a0a0a] hover:bg-[#111] border border-white/5 hover:border-blue-500/30 transition-all duration-300 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-white/5 rounded-lg text-gray-400 group-hover:text-blue-400 group-hover:bg-blue-500/10 transition-colors">
                <v.icon className="w-5 h-5" />
              </div>
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
            </div>
            <div>
              <h5 className="font-mono font-bold text-white text-xs mb-1">{v.name}</h5>
              <p className="text-[10px] text-gray-500 font-mono leading-tight">{v.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </Container>
);

// 3. Re-Asking Visual - Circular Flow
export const ReAskVisual = () => (
  <Container>
    <div className="relative w-full max-w-2xl h-full flex items-center justify-center">
      {/* Central Nodes */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 z-20">
        <NodeCard icon={Brain} label="LLM" subLabel="Generator" active />
      </div>

      <div className="absolute bottom-10 right-20 z-20">
        <NodeCard icon={CheckCircle2} label="Pass" subLabel="Deliver" />
      </div>

      <div className="absolute bottom-10 left-20 z-20">
        <NodeCard icon={RefreshCw} label="Re-Ask" subLabel="Correction" gradient />
      </div>

      {/* SVG Flow Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#ef4444', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#a855f7', stopOpacity: 1 }} />
          </linearGradient>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#444" />
          </marker>
        </defs>

        {/* LLM to Re-Ask (Error Path) */}
        <path d="M 300 130 C 200 200, 150 250, 150 310" stroke="#333" strokeWidth="2" fill="none" strokeDasharray="5,5" markerEnd="url(#arrowhead)" />
        <circle r="4" fill="#ef4444">
          <animateMotion dur="3s" repeatCount="indefinite" path="M 300 130 C 200 200, 150 250, 150 310" />
        </circle>

        {/* Re-Ask to LLM (Feedback Loop) */}
        <path d="M 110 330 C 50 250, 100 100, 250 80" stroke="url(#grad1)" strokeWidth="3" fill="none" />

        {/* Feedback Packet */}
        <foreignObject x="0" y="0" width="100" height="40">
          <div className="px-2 py-1 bg-red-500/20 border border-red-500 text-red-400 text-[8px] font-mono rounded backdrop-blur-md">
            Error Feedback
          </div>
          <animateMotion dur="3s" repeatCount="indefinite" path="M 110 330 C 50 250, 100 100, 250 80" rotate="auto" />
        </foreignObject>

        {/* LLM to Pass (Success Path) */}
        <path d="M 380 130 C 450 200, 500 250, 500 310" stroke="#22c55e" strokeWidth="2" fill="none" strokeOpacity="0.5" />
        <circle r="4" fill="#22c55e">
          <animateMotion dur="3s" begin="1.5s" repeatCount="indefinite" path="M 380 130 C 450 200, 500 250, 500 310" />
        </circle>
      </svg>
    </div>
  </Container>
);

// 4. NLP Scorer Visual - 3D/Space Aesthetic
export const NLPVisual = () => (
  <Container>
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px] opacity-50 perspective-1000 transform rotate-x-12"></div>

      <div className="flex gap-16 relative z-10 items-center">
        {/* Query Vector */}
        <div className="flex flex-col gap-4">
          <div className="glass-card p-4 rounded-xl border-l-4 border-blue-500 w-48">
            <span className="text-[10px] uppercase font-mono text-blue-400 mb-2 block">User Query</span>
            <p className="font-mono text-xs text-white">"treatment for diabetes"</p>
            <div className="mt-3 h-1 w-full bg-blue-500/20 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 w-[80%]"></div>
            </div>
            <span className="text-[9px] font-mono text-gray-500 mt-1 block">Vector: [0.12, 0.88, ...]</span>
          </div>
        </div>

        {/* Comparison Engine */}
        <div className="relative w-32 h-32 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-white/10 animate-[spin_10s_linear_infinite]"></div>
          <div className="absolute inset-4 rounded-full border border-blue-500/30 animate-[spin_5s_linear_infinite_reverse]"></div>
          <div className="bg-[#111] p-4 rounded-full border border-white/20 z-10 shadow-2xl flex flex-col items-center justify-center w-24 h-24">
            <span className="text-2xl font-bold font-mono text-white">0.92</span>
            <span className="text-[8px] font-mono text-muted uppercase">Similarity</span>
          </div>
        </div>

        {/* Domain Context */}
        <div className="flex flex-col gap-4">
          <div className="glass-card p-4 rounded-xl border-l-4 border-green-500 w-48">
            <span className="text-[10px] uppercase font-mono text-green-400 mb-2 block">Healthcare Domain</span>
            <div className="flex gap-2 flex-wrap mb-2">
              {['symptoms', 'diagnosis', 'treatment'].map((t, i) => (
                <span key={i} className="px-2 py-1 bg-green-500/10 rounded text-[9px] text-green-300 font-mono">{t}</span>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-xs font-mono text-white">Match Found</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Container>
);

// 5. Image Context Guard Visual - Blocked Content
export const ImageGuardVisual = () => (
  <Container>
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-2xl">
      {/* Background Image - Simulating Blocked Content */}
      <img
        src="/invalid_landscape_placeholder.png"
        alt="Blocked Content"
        className="absolute inset-0 w-full h-full object-cover opacity-40 blur-sm scale-105"
      />

      {/* Overlay - Content Blocked */}
      <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-4 p-8 text-center backdrop-blur-[2px]">
        <div className="w-20 h-20 rounded-full bg-red-500/10 border-2 border-red-500 flex items-center justify-center mb-2 animate-bounce">
          <Lock className="w-10 h-10 text-red-500" />
        </div>

        <div>
          <h3 className="text-3xl font-mono font-bold text-white mb-2 tracking-tight">CONTENT BLOCKED</h3>
          <p className="font-mono text-sm text-red-200 bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20">
            Image Context Violation Detected
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-2 w-full max-w-xs">
          <div className="flex justify-between text-[10px] font-mono uppercase text-gray-400 border-b border-white/10 pb-1">
            <span>Detector</span>
            <span>Vision LLM</span>
          </div>
          <div className="flex justify-between text-[10px] font-mono uppercase text-gray-400 border-b border-white/10 pb-1">
            <span>Reason</span>
            <span className="text-red-400">Off-Topic (Landscape)</span>
          </div>
          <div className="flex justify-between text-[10px] font-mono uppercase text-gray-400 border-b border-white/10 pb-1">
            <span>Confidence</span>
            <span className="text-blue-400">99.8%</span>
          </div>
        </div>
      </div>
    </div>
  </Container>
);

// 6. Response Scorer Visual - Large Dashboard
export const ScorerVisual = () => (
  <Container>
    <div className="w-full max-w-3xl flex flex-col gap-8">
      <div className="flex justify-between items-end border-b border-white/10 pb-6">
        <div>
          <h3 className="text-2xl font-mono font-bold text-white mb-2">Quality Assessment</h3>
          <p className="font-mono text-xs text-muted">Eval ID: #8821-X9 • Latency: 45ms</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-lg">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="font-mono text-sm font-bold text-green-400">PASSED</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { l: "ROUGE-L", v: 0.88, c: "blue" },
          { l: "Cosine", v: 0.92, c: "purple" },
          { l: "BLEU", v: 0.85, c: "indigo" },
          { l: "Semantic", v: 0.90, c: "pink" }
        ].map((m, i) => (
          <div key={i} className="flex flex-col gap-3 p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
            <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">{m.l}</span>
            <div className="relative w-full aspect-square flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle cx="50%" cy="50%" r="36" stroke="#222" strokeWidth="8" fill="none" />
                <circle cx="50%" cy="50%" r="36" stroke={`var(--color-${m.c}-500)`} strokeWidth="8" fill="none" strokeDasharray="226" strokeDashoffset={226 - (226 * m.v)} className={`text-${m.c}-500 transition-all duration-1000`} strokeLinecap="round" />
              </svg>
              <span className="absolute text-xl font-bold font-mono text-white">{(m.v * 100).toFixed(0)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </Container>
);

// 6. Monitor Visual - Terminal
export const MonitorVisual = () => (
  <Container>
    <div className="w-full h-full flex flex-col bg-[#080808] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
      {/* Window Controls */}
      <div className="h-12 bg-[#111] border-b border-white/5 flex items-center px-4 gap-2 justify-between">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
          <Terminal className="w-3 h-3" />
          <span>monitor.log — bash — 80x24</span>
        </div>
        <div className="w-12"></div>
      </div>

      {/* Log Content */}
      <div className="flex-1 p-6 font-mono text-xs overflow-hidden relative">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100%_24px] pointer-events-none"></div>

        <div className="space-y-3 relative z-10">
          <div className="flex gap-4 text-gray-600 border-b border-white/5 pb-2 mb-4 uppercase tracking-widest text-[10px]">
            <span className="w-20">Timestamp</span>
            <span className="w-16">Level</span>
            <span className="w-24">Component</span>
            <span className="flex-1">Message</span>
          </div>

          {[
            { time: "14:20:01.002", lvl: "INFO", comp: "API_GATE", msg: "Request received: POST /v1/chat/completions", c: "text-blue-400" },
            { time: "14:20:01.045", lvl: "DEBUG", comp: "WALL_GUARD", msg: "Starting validation chain (3 validators)", c: "text-gray-400" },
            { time: "14:20:01.089", lvl: "INFO", comp: "VALIDATOR", msg: "PII_Shield: No PII detected in prompt", c: "text-green-400" },
            { time: "14:20:01.120", lvl: "WARN", comp: "CTX_MGR", msg: "Topic drift detected: Score 0.68 (Threshold 0.65)", c: "text-yellow-400" },
            { time: "14:20:01.450", lvl: "INFO", comp: "SCORER", msg: "Response generated. ROUGE-L: 0.88", c: "text-blue-400" },
            { time: "14:20:01.455", lvl: "SUCCESS", comp: "CORE", msg: "Request completed in 453ms", c: "text-green-400 font-bold" },
          ].map((log, i) => (
            <div key={i} className={`flex gap-4 items-center ${log.c} hover:bg-white/5 p-1 rounded transition-colors cursor-default`}>
              <span className="w-20 text-gray-600 text-[10px]">{log.time}</span>
              <span className="w-16 font-bold">{log.lvl}</span>
              <span className="w-24 text-gray-500">{log.comp}</span>
              <span className="flex-1">{log.msg}</span>
            </div>
          ))}

          <div className="flex gap-2 items-center mt-4">
            <span className="text-green-500">➜</span>
            <span className="text-blue-400">~</span>
            <div className="w-2 h-4 bg-gray-400 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  </Container>
);
