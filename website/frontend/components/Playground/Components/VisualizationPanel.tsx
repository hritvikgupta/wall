import React, { useState, useEffect } from 'react';
import { TrendingUp, BarChart3, Cloud } from 'lucide-react';
import apiClient from '../../../services/api';

const VisualizationPanel: React.FC = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const visualizationData = await apiClient.getVisualizationData();
            setData(visualizationData);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load visualization data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-zinc-400">Loading visualization data...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-red-400">{error}</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full p-6">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-2">
                    <TrendingUp className="text-indigo-500" /> Visualization
                </h2>
                <p className="text-zinc-400 text-sm">
                    Visual analytics for Wall Library features.
                </p>
            </div>

            {data && (
                <div className="space-y-6">
                    {/* Context Boundaries */}
                    {data.context_boundaries && (
                        <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-4">
                            <h3 className="text-sm font-semibold text-zinc-300 mb-3 flex items-center gap-2">
                                <BarChart3 size={16} /> Context Boundaries
                            </h3>
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <div className="flex justify-between text-xs text-zinc-400 mb-1">
                                        <span>Inside Context</span>
                                        <span>{data.context_boundaries.inside}%</span>
                                    </div>
                                    <div className="w-full bg-zinc-800 rounded-full h-2">
                                        <div
                                            className="bg-green-500 h-2 rounded-full"
                                            style={{ width: `${data.context_boundaries.inside}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between text-xs text-zinc-400 mb-1">
                                        <span>Outside Context</span>
                                        <span>{data.context_boundaries.outside}%</span>
                                    </div>
                                    <div className="w-full bg-zinc-800 rounded-full h-2">
                                        <div
                                            className="bg-red-500 h-2 rounded-full"
                                            style={{ width: `${data.context_boundaries.outside}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Word Frequencies */}
                    {data.word_frequencies && (
                        <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-4">
                            <h3 className="text-sm font-semibold text-zinc-300 mb-3 flex items-center gap-2">
                                <Cloud size={16} /> Word Frequencies
                            </h3>
                            <div className="space-y-2">
                                {Object.entries(data.word_frequencies)
                                    .sort(([, a]: any, [, b]: any) => b - a)
                                    .slice(0, 10)
                                    .map(([word, count]: [string, any]) => (
                                        <div key={word} className="flex items-center justify-between text-sm">
                                            <span className="text-zinc-400">{word}</span>
                                            <div className="flex items-center gap-2">
                                                <div className="w-24 bg-zinc-800 rounded-full h-2">
                                                    <div
                                                        className="bg-indigo-500 h-2 rounded-full"
                                                        style={{ width: `${(count / 10) * 100}%` }}
                                                    />
                                                </div>
                                                <span className="text-zinc-200 font-mono w-8 text-right">{count}</span>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}

                    {/* 3D Scores Placeholder */}
                    {data.scores && data.scores.length > 0 && (
                        <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-4">
                            <h3 className="text-sm font-semibold text-zinc-300 mb-3">3D Score Visualization</h3>
                            <div className="text-xs text-zinc-500">
                                {data.scores.length} data points available. 3D visualization would render here.
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default VisualizationPanel;
