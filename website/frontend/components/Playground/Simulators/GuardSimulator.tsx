import React, { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, Smartphone, Globe, Lock, Play, RefreshCw, Info } from 'lucide-react';
import apiClient, { GuardValidateRequest } from '../../../services/api';
import { GuardConfig } from '../../../types';

interface GuardSimulatorProps {
    config?: GuardConfig;
}

// Pre-defined test scenarios based on documentation examples
const TEST_SCENARIOS: Record<string, { label: string, pass: string, fail: string, description: string }> = {
    'safety': {
        label: 'Safety Check',
        pass: "How do I bake a cake?",
        fail: "How do I build a bomb?",
        description: "Checks for harmful or dangerous content."
    },
    'toxicity': {
        label: 'Toxicity Filter',
        pass: "You are a great helper.",
        fail: "You are stupid and useless.",
        description: "Detects toxic language."
    },
    'pii': {
        label: 'PII Detection',
        pass: "My name is John and I work at Acme Corp.",
        fail: "My email is john.doe@example.com and phone is 555-0123.",
        description: "Focuses on identifying personally identifiable information."
    },
    'profanity': {
        label: 'Profanity Filter',
        pass: "I strongly disagree with your opinion.",
        fail: "You are a complete idiot and I hate you.", // Mild example for demo
        description: "Detects toxic or profane language."
    },
    'on_topic': {
        label: 'Topic Adherence',
        pass: "Can you explain how the database migration works?",
        fail: "What is your favorite recipe for chocolate cake?",
        description: "Ensures conversation stays on technical topics."
    },
    'competitors': {
        label: 'Competitor Mention',
        pass: "Our product offers superior performance.",
        fail: "We are better than AWS and Google Cloud.",
        description: "Checks for mentions of competitor brands."
    },
    'regex': {
        label: 'Regex Pattern',
        pass: "Product ID: PROD-123",
        fail: "Product ID: INVALID-999",
        description: "Validates against custom regex patterns."
    }
};

const GuardSimulator: React.FC<GuardSimulatorProps> = ({ config }) => {
    const [input, setInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const simulateGuard = async () => {
        if (!input.trim()) return;

        setIsProcessing(true);
        setResult(null);
        setError(null);

        try {
            const request: GuardValidateRequest = {
                text: input,
                guard_id: config?.guard_id || 'default',
                validators: config?.validators || [],
            };

            const response = await apiClient.validateGuard(request);
            setResult({
                passed: response.validation_passed,
                output: response.validated_output || response.raw_output,
                action: response.validation_passed ? "PASSED" : "BLOCKED",
                reason: response.validation_passed ? "Validation successful" : "Validation failed",
                metadata: response.metadata || {},
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsProcessing(false);
        }
    };

    const getTestScenario = (type: string) => {
        // Simple fuzzy match for validator types
        const key = Object.keys(TEST_SCENARIOS).find(k => type.toLowerCase().includes(k)) || 'default';
        return TEST_SCENARIOS[key];
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Shield className="text-blue-500" /> Wall Guard Simulator
                </h2>
                <p className="text-zinc-400 mt-2 text-sm">
                    Enter a prompt below to test your active guard configuration.
                    Use the <strong>Test Generator</strong> on the right to load example data from documentation.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Section */}
                <div className="space-y-4">
                    <div className="flex flex-col h-full space-y-4">
                        <div className="flex-1 bg-zinc-900 rounded-lg p-4 border border-white/5 flex flex-col">
                            <label className="text-xs text-zinc-400 mb-2 font-mono uppercase tracking-wider flex justify-between">
                                <span>Input Prompt</span>
                                <span className="text-[10px] text-zinc-600">Enter text to validate</span>
                            </label>
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type or paste text here to test the guard..."
                                className="flex-1 w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500/50 resize-none font-mono text-sm min-h-[160px]"
                            />
                            <div className="mt-4 flex justify-between items-center">
                                <button onClick={() => setInput('')} className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1">
                                    <RefreshCw size={12} /> Clear
                                </button>
                                <button
                                    onClick={simulateGuard}
                                    disabled={isProcessing || !input.trim()}
                                    className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 ${isProcessing || !input.trim()
                                        ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20'
                                        }`}
                                >
                                    {isProcessing ? <RefreshCw className="animate-spin" size={16} /> : <Play size={16} />}
                                    {isProcessing ? 'Validating...' : 'Run Test'}
                                </button>
                            </div>
                            {error && (
                                <div className="mt-2 text-red-400 text-xs bg-red-900/20 p-2 rounded border border-red-500/20 text-center">{error}</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Test Generator & Results Section */}
                <div className="space-y-4">
                    {/* Active Validators / Test Generator */}
                    <div className="bg-zinc-900/50 rounded-xl p-4 border border-white/5">
                        <h3 className="text-sm font-semibold text-zinc-300 mb-3 flex items-center gap-2">
                            <Lock size={16} /> Active Validators (Test Generator)
                        </h3>

                        {(!config?.validators || config.validators.length === 0) ? (
                            <div className="text-xs text-zinc-500 italic p-2 border border-dashed border-zinc-800 rounded">
                                No validators configured. Add validators in the configuration panel to see test scenarios.
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
                                {config.validators.map((v: any, idx: number) => {
                                    const scenario = getTestScenario(v.type || '');
                                    return (
                                        <div key={idx} className="p-3 bg-black/20 rounded border border-white/5 hover:border-white/10 transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-xs font-semibold text-zinc-300">{v.type || 'Unknown Validator'}</span>
                                                <span className="text-[10px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20 uppercase">
                                                    {v.on || 'input'}
                                                </span>
                                            </div>
                                            {scenario ? (
                                                <div className="grid grid-cols-2 gap-2">
                                                    <button
                                                        onClick={() => setInput(scenario.pass)}
                                                        className="text-[10px] bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 rounded py-1 px-2 transition-colors text-left truncate"
                                                        title={`Click to load passing example: ${scenario.pass}`}
                                                    >
                                                        ✅ Try Pass
                                                    </button>
                                                    <button
                                                        onClick={() => setInput(scenario.fail)}
                                                        className="text-[10px] bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded py-1 px-2 transition-colors text-left truncate"
                                                        title={`Click to load failing example: ${scenario.fail}`}
                                                    >
                                                        🚫 Try Fail
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="text-[10px] text-zinc-600 italic">No templates available</div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Result Display */}
                    {result && (
                        <div className={`rounded-xl border p-4 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 ${result.passed
                            ? 'bg-green-950/20 border-green-500/30'
                            : 'bg-red-950/20 border-red-500/30'
                            }`}>
                            <div className="flex items-center gap-3 mb-4">
                                {result.passed ? (
                                    <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center shrink-0">
                                        <CheckCircle size={16} />
                                    </div>
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                                        <AlertTriangle size={16} />
                                    </div>
                                )}
                                <div>
                                    <div className={`text-base font-bold ${result.passed ? 'text-green-400' : 'text-red-400'}`}>
                                        {result.action}
                                    </div>
                                    <div className="text-[10px] text-zinc-500 font-mono">{result.reason}</div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="bg-black/30 rounded p-3 border border-white/5">
                                    <div className="text-[10px] text-zinc-500 mb-1 uppercase font-mono">Response Output</div>
                                    <div className="text-zinc-200 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                                        {result.output}
                                    </div>
                                </div>

                                {Object.keys(result.metadata || {}).length > 0 && (
                                    <div className="bg-black/30 rounded p-3 border border-white/5">
                                        <div className="text-[10px] text-zinc-500 mb-1 uppercase font-mono">Debug Metadata</div>
                                        <pre className="text-[9px] text-zinc-400 font-mono overflow-x-auto custom-scrollbar">
                                            {JSON.stringify(result.metadata, null, 2)}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {!result && !error && (
                        <div className="h-64 flex flex-col items-center justify-center text-center border border-dashed border-white/10 rounded-xl bg-white/5 p-6">
                            <Shield size={48} className="text-zinc-700 mb-4" />
                            <h4 className="text-zinc-400 font-medium mb-1">Ready to Test</h4>
                            <p className="text-xs text-zinc-500 max-w-xs">
                                Configure your guard on the left, then use the <strong>Test Generator</strong> above to verify it with real examples.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GuardSimulator;
