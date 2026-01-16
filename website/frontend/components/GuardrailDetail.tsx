import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { guardrails } from "../data/guardrails";
import guardrailsExamples from "../data/guardrails-examples.json";
import { ArrowLeft, Copy, Check, Shield, Terminal, ArrowRight, Download, BookOpen, Code, FileText, BarChart3, Info } from "lucide-react";
import Prism from "prismjs";
import ReactMarkdown from "react-markdown";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-python";

interface ExampleSection {
    title: string;
    steps?: Array<{
        title: string;
        type: string;
        code?: string;
        input?: string;
        output?: string;
        content?: string;
    }>;
    code?: string;
}

interface GuardrailExample {
    id: string;
    name: string;
    sections: {
        documentation?: ExampleSection;
        installation?: ExampleSection;
        tutorial?: ExampleSection;
        completeExample?: ExampleSection;
        logging?: ExampleSection;
        visualization?: ExampleSection;
    };
}

// Reusable Terminal Window Component
const TerminalWindow: React.FC<{
    title: string;
    children: React.ReactNode;
    onCopy: () => void;
    copied: boolean;
    input?: string;
    output?: string;
}> = ({ title, children, onCopy, copied, input, output }) => (
    <div className="bg-[#1b1913] border border-white/10 rounded-xl overflow-hidden font-mono shadow-2xl mt-4 mb-8">
        {/* Top Bar / Command Bar */}
        <div className="bg-[#1b1913] h-9 border-b border-white/5 flex items-center px-4 justify-between shrink-0">
            <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-[#3d3d3d]"></div>
                <div className="w-3 h-3 rounded-full bg-[#3d3d3d]"></div>
                <div className="w-3 h-3 rounded-full bg-[#3d3d3d]"></div>
            </div>
            <div className="text-[10px] text-muted flex items-center gap-2 opacity-50">
                <span>{title}</span>
            </div>
            {/* Copy Button styled to fit header */}
            <button
                onClick={onCopy}
                className="text-gray-500 hover:text-white transition-colors p-1"
                title="Copy code"
            >
                {copied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
            </button>
        </div>

        {/* Code Content */}
        <div className="p-4 overflow-x-auto relative group">
            {children}
        </div>

        {/* Input/Output Sections */}
        {(input || output) && (
            <div className="border-t border-white/5 bg-[#000000]/20">
                {input && (
                    <div className="px-4 py-3 border-b border-white/5 last:border-0 bg-blue-500/5">
                        <div className="flex gap-3 text-[10px] font-mono">
                            <span className="font-bold uppercase tracking-wider select-none text-blue-500 shrink-0">Input:</span>
                            <span className="font-medium text-blue-300/90 leading-relaxed">{input}</span>
                        </div>
                    </div>
                )}
                {output && (
                    <div className="px-4 py-3 border-b border-white/5 last:border-0 bg-green-500/5">
                        <div className="flex gap-3 text-[10px] font-mono">
                            <span className="font-bold uppercase tracking-wider select-none text-green-500 shrink-0">Output:</span>
                            <span className="font-medium text-green-300/90 leading-relaxed">{output}</span>
                        </div>
                    </div>
                )}
            </div>
        )}
    </div>
);

const GuardrailDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const guardrail = guardrails.find((g) => g.id === id);
    const examples = guardrailsExamples as { guardrails: GuardrailExample[] };
    const example = examples.guardrails.find((e) => e.id === id);
    const [copied, setCopied] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<string>("installation");

    useEffect(() => {
        Prism.highlightAll();
    }, [guardrail, activeTab]);

    const handleCopy = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopied(code);
        setTimeout(() => setCopied(null), 2000);
    };

    const tabs = [
        { id: "documentation", label: "Documentation", icon: Info },
        { id: "installation", label: "Installation", icon: Download },
        { id: "tutorial", label: "Tutorial", icon: BookOpen },
        { id: "completeExample", label: "Complete Example", icon: Code },
        { id: "logging", label: "Logging", icon: FileText },
        { id: "visualization", label: "Visualization", icon: BarChart3 },
    ];

    // Set active tab to documentation (first) if available, otherwise first available section
    useEffect(() => {
        if (example) {
            // Prioritize documentation tab if available
            if (example.sections.documentation) {
                setActiveTab("documentation");
            } else {
                const availableTabs = tabs.filter(tab => example.sections[tab.id as keyof typeof example.sections]);
                if (availableTabs.length > 0 && !availableTabs.some(tab => tab.id === activeTab)) {
                    setActiveTab(availableTabs[0].id);
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [example, id]);

    if (!guardrail) {
        return (
            <div className="min-h-screen bg-background text-text flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-bold mb-4">Guardrail not found</h2>
                    <Link to="/guardrails" className="text-sm text-muted hover:text-white hover:underline">
                        Back to Library
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-text pb-20 font-sans">

            {/* Sticky Sub-Header */}
            <div className="sticky top-[72px] z-30 bg-background/95 backdrop-blur-md border-b border-white/5 py-3">
                <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            to="/guardrails"
                            className="inline-flex items-center text-xs text-muted hover:text-white transition-colors group"
                        >
                            <ArrowLeft className="h-3.5 w-3.5 mr-1 group-hover:-translate-x-1 transition-transform" />
                            Back
                        </Link>
                        <div className="h-4 w-px bg-white/10"></div>
                        <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-muted" />
                            <span className="text-sm font-semibold text-text">{guardrail.name}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 md:px-12 pt-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Description Section */}
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                    <Shield className="h-8 w-8 text-text" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-text tracking-tight mb-1">
                                        {guardrail.name}
                                    </h1>
                                    <div className="flex items-center gap-2 text-xs font-mono text-muted">
                                        <span className="uppercase tracking-wider">Guardrail Model</span>
                                        <span>•</span>
                                        <span>Updated just now</span>
                                    </div>
                                </div>
                            </div>

                            <p className="text-sm md:text-base text-muted leading-relaxed border-l-2 border-white/10 pl-4">
                                {guardrail.description}
                            </p>
                        </div>

                        {/* Quick Start Section */}
                        <div>
                            <h2 className="text-sm font-bold text-text mb-4 flex items-center gap-2 uppercase tracking-wide">
                                <Terminal className="h-4 w-4 text-muted" />
                                Quick Start
                            </h2>
                            <TerminalWindow
                                title="quick_start.py"
                                onCopy={() => handleCopy(guardrail.codeSnippet)}
                                copied={copied === guardrail.codeSnippet}
                            >
                                <pre className="!m-0 !bg-transparent !p-0 overflow-x-auto text-xs font-mono leading-relaxed">
                                    <code className="language-python">
                                        {guardrail.codeSnippet}
                                    </code>
                                </pre>
                            </TerminalWindow>
                        </div>

                        {/* Comprehensive Examples Section */}
                        {example && (
                            <div>
                                <h2 className="text-sm font-bold text-text mb-4 flex items-center gap-2 uppercase tracking-wide">
                                    <Code className="h-4 w-4 text-muted" />
                                    Comprehensive Guide
                                </h2>

                                {/* Tabs */}
                                <div className="flex flex-wrap gap-2 mb-6 border-b border-white/5">
                                    {tabs.map((tab) => {
                                        const Icon = tab.icon;
                                        const section = example.sections[tab.id as keyof typeof example.sections];
                                        if (!section) return null;

                                        return (
                                            <button
                                                key={tab.id}
                                                onClick={() => setActiveTab(tab.id)}
                                                className={`flex items-center gap-2 px-4 py-2 text-xs font-medium transition-colors border-b-2 ${activeTab === tab.id
                                                    ? "border-text text-text"
                                                    : "border-transparent text-muted hover:text-text"
                                                    }`}
                                            >
                                                <Icon className="h-3.5 w-3.5" />
                                                {tab.label}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Tab Content */}
                                {(() => {
                                    const section = example.sections[activeTab as keyof typeof example.sections];
                                    if (!section) return null;

                                    return (
                                        <div className="space-y-6">
                                            <h3 className="text-lg font-bold text-text">{section.title}</h3>

                                            {/* Documentation content (text-based) */}
                                            {activeTab === "documentation" && section.steps && (
                                                <div className="space-y-4">
                                                    {section.steps.map((step, idx) => (
                                                        <div key={idx} className="space-y-3">
                                                            {step.title && (
                                                                <h4 className="text-base font-semibold text-text">{step.title}</h4>
                                                            )}
                                                            {step.content && (
                                                                <div className="bg-[#1c1c1a] border border-white/5 rounded-xl p-6">
                                                                    <div className="prose prose-invert max-w-none text-sm text-muted leading-relaxed">
                                                                        <ReactMarkdown>
                                                                            {step.content}
                                                                        </ReactMarkdown>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Steps (for installation and tutorial) */}
                                            {activeTab !== "documentation" && section.steps && section.steps.map((step, idx) => (
                                                <div key={idx} className="space-y-3">
                                                    <h4 className="text-sm font-semibold text-text">{step.title}</h4>

                                                    {step.type === "code" && step.code && (
                                                        <TerminalWindow
                                                            title={`${step.title.toLowerCase().replace(/\s+/g, "_")}.py`}
                                                            onCopy={() => handleCopy(step.code!)}
                                                            copied={copied === step.code}
                                                            input={step.input}
                                                            output={step.output}
                                                        >
                                                            <pre className="!m-0 !bg-transparent !p-0 overflow-x-auto text-xs font-mono leading-relaxed">
                                                                <code className="language-python">{step.code}</code>
                                                            </pre>
                                                        </TerminalWindow>
                                                    )}

                                                    {step.type === "text" && step.content && (
                                                        <div className="bg-[#1c1c1a] border border-white/5 rounded-xl p-4">
                                                            <div className="text-sm text-muted leading-relaxed whitespace-pre-line">
                                                                {step.content}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}

                                            {/* Complete Code (for completeExample, logging, visualization) */}
                                            {activeTab !== "documentation" && section.code && (
                                                <TerminalWindow
                                                    title={activeTab === "completeExample" ? "complete_example.py" :
                                                        activeTab === "logging" ? "logging_example.py" :
                                                            "visualization_example.py"}
                                                    onCopy={() => handleCopy(section.code!)}
                                                    copied={copied === section.code}
                                                >
                                                    <pre className="!m-0 !bg-transparent !p-0 overflow-x-auto text-xs font-mono leading-relaxed">
                                                        <code className="language-python">{section.code}</code>
                                                    </pre>
                                                </TerminalWindow>
                                            )}
                                        </div>
                                    );
                                })()}
                            </div>
                        )}
                    </div>

                    {/* Sticky Sidebar Info */}
                    <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-40">
                        <div className="bg-[#1c1c1a] border border-white/5 rounded-xl p-5 shadow-sm">
                            <h3 className="text-[10px] font-bold text-muted uppercase tracking-widest mb-4 border-b border-white/5 pb-2">
                                Metadata
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-muted">Type</span>
                                    <span className="text-xs font-mono text-text bg-white/5 px-2 py-1 rounded border border-white/5">{guardrail.type}</span>
                                </div>

                                <div>
                                    <span className="text-xs text-muted block mb-2">Tags</span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {guardrail.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="text-[10px] font-medium text-text bg-white/5 border border-white/10 hover:border-white/20 px-2.5 py-1 rounded transition-colors cursor-default"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-white/5 flex justify-between items-center">
                                    <span className="text-xs text-muted">License</span>
                                    <span className="text-xs text-text">Apache 2.0</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-500/5 to-purple-500/5 border border-white/5 rounded-xl p-5">
                            <h3 className="text-sm font-bold text-text mb-2">Need Integration Help?</h3>
                            <p className="text-xs text-muted mb-4 leading-relaxed">
                                Check our documentation for advanced configuration, custom validators, and performance tuning.
                            </p>
                            <Link
                                to="/documentation"
                                className="inline-flex items-center text-xs font-semibold text-text hover:text-white transition-colors hover:underline decoration-white/30 underline-offset-4"
                            >
                                Read Documentation <ArrowRight className="h-3 w-3 ml-1" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GuardrailDetail;
