import React, { useState } from 'react';
import { BarChart2, RefreshCw } from 'lucide-react';
import apiClient, { ScorerCalculateRequest } from '../../../services/api';
import { ScorerConfig } from '../../../types';

interface ScorerSimulatorProps {
    config?: ScorerConfig;
}

const ScorerSimulator: React.FC<ScorerSimulatorProps> = ({ config }) => {
    const [response, setResponse] = useState('Diabetes symptoms include increased thirst, frequent urination, and fatigue.');
    const [reference, setReference] = useState('Common symptoms of diabetes are excessive thirst, needing to pee often, and feeling very tired.');
    const [scores, setScores] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const calculateScores = async () => {
        setLoading(true);
        setError(null);
        try {
            const request: ScorerCalculateRequest = {
                response: response,
                reference: reference,
                scorer_id: config?.scorer_id || 'default',
                metrics: config?.metrics || ['cosine', 'semantic', 'rouge', 'bleu'],
            };

            const result = await apiClient.calculateScores(request);
            setScores(result.scores);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <BarChart2 className="text-purple-500" /> Response Scorer
                </h2>
                <p className="text-zinc-400 mt-2">
                    Evaluate the quality of LLM responses against a reference truth using industry-standard metrics.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">LLM Response (Candidate)</label>
                    <textarea
                        value={response}
                        onChange={(e) => setResponse(e.target.value)}
                        className="w-full h-32 bg-zinc-900/50 border border-white/10 rounded-xl p-4 text-sm text-zinc-200 focus:outline-none focus:border-purple-500/50 resize-none"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Reference (Ground Truth)</label>
                    <textarea
                        value={reference}
                        onChange={(e) => setReference(e.target.value)}
                        className="w-full h-32 bg-zinc-900/50 border border-white/10 rounded-xl p-4 text-sm text-zinc-200 focus:outline-none focus:border-purple-500/50 resize-none"
                    />
                </div>
            </div>

            <div className="flex justify-center mb-10">
                <button
                    onClick={calculateScores}
                    disabled={loading}
                    className="flex items-center gap-2 px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-full shadow-lg shadow-purple-900/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? <RefreshCw className="animate-spin" size={18} /> : <BarChart2 size={18} />}
                    Calculate Scores
                </button>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-950/20 border border-red-500/30 rounded-xl p-4 mb-6">
                    <p className="text-red-400 text-sm">{error}</p>
                </div>
            )}

            {/* Results Area */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['CosineSimilarityMetric', 'ROUGEMetric', 'BLEUMetric', 'SemanticSimilarityMetric'].map((label, idx) => {
                    const key = ['CosineSimilarityMetric', 'ROUGEMetric', 'BLEUMetric', 'SemanticSimilarityMetric'][idx];
                    const displayName = ['Cosine', 'ROUGE', 'BLEU', 'Semantic'][idx];
                    const val = scores ? (scores[key] || 0).toFixed(2) : '0.00';
                    const numVal = parseFloat(val);

                    return (
                        <div key={label} className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden group">
                            <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent ${numVal > 0.7 ? 'via-green-500' : 'via-yellow-500'} to-transparent opacity-50`}></div>

                            <span className="text-xs text-zinc-500 uppercase font-bold tracking-widest mb-3 text-center">{displayName}</span>
                            <div className={`text-4xl font-mono font-bold ${!scores ? 'text-zinc-700' :
                                    numVal > 0.8 ? 'text-green-400' :
                                        numVal > 0.5 ? 'text-yellow-400' : 'text-red-400'
                                }`}>
                                {val}
                            </div>

                            {/* Mini visual indicator */}
                            <div className="w-full h-1 bg-zinc-800 rounded-full mt-4 overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-1000 ease-out ${!scores ? 'w-0' :
                                            numVal > 0.8 ? 'bg-green-500' :
                                                numVal > 0.5 ? 'bg-yellow-500' : 'bg-red-500'
                                        }`}
                                    style={{ width: `${numVal * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ScorerSimulator;
