import React, { useState } from 'react';
import { Brain, CheckCircle, XCircle, TrendingUp, Settings, Key, MessageSquare } from 'lucide-react';
import apiClient, { ContextCheckRequest } from '../../../services/api';
import { ContextConfig } from '../../../types';

interface ContextManagerPanelProps {
    config?: ContextConfig;
}

const ContextManagerPanel: React.FC<ContextManagerPanelProps> = ({ config }) => {
    // Mode State
    const [mode, setMode] = useState<'text' | 'image'>('text');

    const [input, setInput] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    // New State for Advanced Options
    const [strategy, setStrategy] = useState<'heuristic' | 'llm_check'>('heuristic');
    const [useAdvanced, setUseAdvanced] = useState(false);

    // LLM Settings
    const [llmProvider, setLlmProvider] = useState('openai');
    const [llmModel, setLlmModel] = useState('gpt-3.5-turbo');
    const [vllmModel, setVllmModel] = useState('gpt-4-vision-preview');
    const [apiKey, setApiKey] = useState('');
    const [llmTemperature, setLlmTemperature] = useState(0.0);
    const [llmPrompt, setLlmPrompt] = useState(''); // Default empty to use internal CoT if not provided
    const [vllmPrompt, setVllmPrompt] = useState(
        'Context:\n{context}\n\nIs this image consistent with or allowed by the above context? Answer only "yes" or "no".'
    );
    const [showConfig, setShowConfig] = useState(false);

    const handleCheck = async () => {
        if (mode === 'text' && !input.trim()) return;
        if (mode === 'image' && !imageUrl.trim()) return;

        setIsProcessing(true);
        setError(null);
        setResult(null);

        try {
            if (mode === 'text') {
                const request: ContextCheckRequest = {
                    text: input,
                    context_id: config?.context_id || 'default',
                    keywords: config?.keywords || [],
                    approved_contexts: config?.approved_contexts || [],
                    threshold: config?.threshold || 0.7,
                    use_advanced_algo: useAdvanced,
                    strategy: strategy,
                    ...(strategy === 'llm_check' && {
                        llm_provider: llmProvider,
                        llm_model: llmModel,
                        llm_prompt_template: llmPrompt || undefined, // Send undefined if empty to trigger default in backend
                        openai_api_key: apiKey,
                        llm_temperature: llmTemperature
                    })
                };
                const response = await apiClient.checkContext(request);
                setResult({ ...response, type: 'text' });
            } else {
                const request: any = {
                    image: imageUrl,
                    context_id: config?.context_id || 'default',
                    keywords: config?.keywords || [],
                    approved_contexts: config?.approved_contexts || [],
                    llm_provider: 'openai', // Force OpenAI for VLLM for now
                    llm_model: vllmModel,
                    llm_prompt_template: vllmPrompt,
                    openai_api_key: apiKey,
                    llm_temperature: llmTemperature
                };
                const response = await apiClient.checkImageContext(request);
                setResult({ ...response, type: 'image' });
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="flex flex-col h-full p-6 space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-2">
                        <Brain className="text-purple-500" /> Context Manager
                    </h2>
                    <p className="text-zinc-400 text-sm">
                        Test semantic validation and image context guards.
                    </p>
                </div>
                <div className="flex gap-2">
                    <div className="bg-zinc-800 p-1 rounded-lg flex text-xs font-semibold">
                        <button
                            onClick={() => setMode('text')}
                            className={`px-3 py-1.5 rounded-md transition-all ${mode === 'text' ? 'bg-purple-600 text-white shadow' : 'text-zinc-400 hover:text-white'}`}
                        >
                            Text
                        </button>
                        <button
                            onClick={() => setMode('image')}
                            className={`px-3 py-1.5 rounded-md transition-all ${mode === 'image' ? 'bg-purple-600 text-white shadow' : 'text-zinc-400 hover:text-white'}`}
                        >
                            Image
                        </button>
                    </div>
                    <button
                        onClick={() => setShowConfig(!showConfig)}
                        className={`p-2 rounded-lg transition-colors ${showConfig ? 'bg-purple-500/20 text-purple-400' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}
                    >
                        <Settings size={20} />
                    </button>
                </div>
            </div>

            {/* Configuration Panel */}
            {showConfig && (
                <div className="bg-zinc-900/80 border border-white/10 rounded-xl p-5 space-y-4 animate-in fade-in slide-in-from-top-2">
                    <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                        {mode === 'text' ? 'Analysis Strategy' : 'Image Guard Settings'}
                    </h3>

                    {mode === 'text' && (
                        <div className="flex gap-2 mb-4">
                            <button
                                onClick={() => setStrategy('heuristic')}
                                className={`flex-1 py-2 px-3 rounded-lg text-sm transition-all border ${strategy === 'heuristic'
                                        ? 'bg-purple-600/20 border-purple-500 text-white'
                                        : 'bg-zinc-800 border-white/5 text-zinc-400 hover:bg-zinc-700'
                                    }`}
                            >
                                NLP Heuristics
                            </button>
                            <button
                                onClick={() => setStrategy('llm_check')}
                                className={`flex-1 py-2 px-3 rounded-lg text-sm transition-all border ${strategy === 'llm_check'
                                        ? 'bg-purple-600/20 border-purple-500 text-white'
                                        : 'bg-zinc-800 border-white/5 text-zinc-400 hover:bg-zinc-700'
                                    }`}
                            >
                                LLM Guard (CoT)
                            </button>
                        </div>
                    )}

                    {mode === 'text' && strategy === 'heuristic' && (
                        <div className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg border border-white/5">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={useAdvanced}
                                    onChange={(e) => setUseAdvanced(e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                            </label>
                            <span className="text-zinc-300 text-sm">Use Advanced Algorithm (Hybrid Score)</span>
                        </div>
                    )}

                    <div className="pl-4 border-l-2 border-purple-500/20 space-y-3">
                        {(mode === 'image' || (mode === 'text' && strategy === 'llm_check')) && (
                            <>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-zinc-500 block mb-1">Provider</label>
                                        <select
                                            value={llmProvider}
                                            onChange={(e) => setLlmProvider(e.target.value)}
                                            className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-300"
                                        >
                                            <option value="openai">OpenAI</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-zinc-500 block mb-1">Model</label>
                                        <input
                                            type="text"
                                            value={mode === 'text' ? llmModel : vllmModel}
                                            onChange={(e) => mode === 'text' ? setLlmModel(e.target.value) : setVllmModel(e.target.value)}
                                            className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-300"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs text-zinc-500 block mb-1">
                                        Temperature: <span className="text-purple-400">{llmTemperature}</span>
                                    </label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.1"
                                        value={llmTemperature}
                                        onChange={(e) => setLlmTemperature(parseFloat(e.target.value))}
                                        className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-zinc-500 block mb-1">API Key (Optional if env set)</label>
                                    <div className="relative">
                                        <Key size={14} className="absolute left-3 top-3 text-zinc-500" />
                                        <input
                                            type="password"
                                            value={apiKey}
                                            onChange={(e) => setApiKey(e.target.value)}
                                            placeholder="sk-..."
                                            className="w-full bg-zinc-800 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-300"
                                        />
                                    </div>
                                </div>

                                {mode === 'text' && (
                                    <div>
                                        <label className="text-xs text-zinc-500 block mb-1">Custom CoT Prompt (Optional)</label>
                                        <div className="relative">
                                            <MessageSquare size={14} className="absolute left-3 top-3 text-zinc-500" />
                                            <textarea
                                                value={llmPrompt}
                                                onChange={(e) => setLlmPrompt(e.target.value)}
                                                placeholder="Leave empty to use built-in comprehensive Chain of Thought prompt..."
                                                className="w-full bg-zinc-800 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-300 h-24 text-xs font-mono"
                                            />
                                        </div>
                                        <p className="text-xs text-zinc-600 mt-1">Use {'{context}'}, {'{keywords}'}, and {'{text}'}.</p>
                                    </div>
                                )}

                                {mode === 'image' && (
                                    <div>
                                        <label className="text-xs text-zinc-500 block mb-1">Verification Prompt</label>
                                        <textarea
                                            value={vllmPrompt}
                                            onChange={(e) => setVllmPrompt(e.target.value)}
                                            className="w-full bg-zinc-800 border border-white/10 rounded-lg p-2 text-sm text-zinc-300 h-24 text-xs font-mono"
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}

            <div className="flex-1 flex flex-col gap-6">
                {/* Input Section */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-300">
                        {mode === 'text' ? 'Input Text' : 'Image URL'}
                    </label>

                    {mode === 'text' ? (
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Enter text to check against context boundaries..."
                            className="w-full h-32 bg-zinc-900/50 border border-white/10 rounded-xl p-4 text-sm text-zinc-200 focus:outline-none focus:border-purple-500/50 resize-none"
                        />
                    ) : (
                        <input
                            type="text"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="Enter image URL to analyze (e.g., https://example.com/image.jpg)"
                            className="w-full bg-zinc-900/50 border border-white/10 rounded-xl p-4 text-sm text-zinc-200 focus:outline-none focus:border-purple-500/50"
                        />
                    )}

                    <button
                        onClick={handleCheck}
                        disabled={isProcessing || (mode === 'text' ? !input.trim() : !imageUrl.trim())}
                        className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all ${isProcessing || (mode === 'text' ? !input.trim() : !imageUrl.trim())
                            ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
                            : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/20'
                            }`}
                    >
                        {isProcessing ? 'Checking...' : `Check ${mode === 'text' ? 'Context' : 'Image'}`}
                    </button>
                </div>

                {/* Results Section */}
                {error && (
                    <div className="bg-red-950/20 border border-red-500/30 rounded-xl p-4">
                        <p className="text-red-400 text-sm">{error}</p>
                    </div>
                )}

                {result && (
                    <div className="space-y-4">
                        <div className={`rounded-xl border p-6 ${result.is_valid
                            ? 'bg-green-950/20 border-green-500/30'
                            : 'bg-red-950/20 border-red-500/30'
                            }`}>
                            <div className="flex items-center gap-3 mb-4">
                                {result.is_valid ? (
                                    <>
                                        <CheckCircle className="text-green-400" size={24} />
                                        <span className="text-lg font-bold text-green-400">
                                            {result.type === 'text' ? 'Within Context' : 'Image Approved'}
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="text-red-400" size={24} />
                                        <span className="text-lg font-bold text-red-400">
                                            {result.type === 'text' ? 'Outside Context' : 'Image Rejected'}
                                        </span>
                                    </>
                                )}
                            </div>

                            {result.type === 'image' && (
                                <div className="text-sm text-zinc-400">
                                    Analyzed by: <span className="text-white font-mono">{result.provider}</span>
                                </div>
                            )}

                            {result.type === 'text' && (
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-zinc-400">Threshold:</span>
                                        <span className="text-zinc-200">{result.threshold}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-zinc-400">Max Similarity:{useAdvanced ? ' (Hybrid)' : ''}</span>
                                        <span className="text-zinc-200">{result.max_similarity?.toFixed(3)}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {result.type === 'text' && result.similarities && result.similarities.length > 0 && (
                            <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-4">
                                <h3 className="text-sm font-semibold text-zinc-300 mb-3 flex items-center gap-2">
                                    <TrendingUp size={16} /> Similarity Scores
                                </h3>
                                <div className="space-y-2">
                                    {result.similarities.map((sim: any, idx: number) => (
                                        <div key={idx} className="flex items-center justify-between text-xs">
                                            <span className="text-zinc-400 truncate flex-1 mr-2">
                                                {sim.context.substring(0, 50)}...
                                            </span>
                                            <span className={`font-mono ${sim.similarity >= result.threshold ? 'text-green-400' : 'text-red-400'
                                                }`}>
                                                {sim.similarity.toFixed(3)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContextManagerPanel;
