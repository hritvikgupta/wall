import React, { useState, useEffect } from 'react';
import { Activity, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import apiClient from '../../../services/api';

const MonitorDashboard: React.FC = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadStats();
        const interval = setInterval(loadStats, 5000); // Refresh every 5 seconds
        return () => clearInterval(interval);
    }, []);

    const loadStats = async () => {
        try {
            const data = await apiClient.getMonitorStats();
            setStats(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load stats');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !stats) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-zinc-400">Loading monitoring data...</div>
            </div>
        );
    }

    if (error && !stats) {
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
                    <Activity className="text-blue-500" /> LLM Monitor
                </h2>
                <p className="text-zinc-400 text-sm">
                    Real-time monitoring of LLM interactions, performance, and errors.
                </p>
            </div>

            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-zinc-400 uppercase">Total Interactions</span>
                            <Activity className="text-blue-400" size={16} />
                        </div>
                        <div className="text-2xl font-bold text-white">{stats.total_interactions}</div>
                    </div>

                    <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-zinc-400 uppercase">Success Rate</span>
                            <TrendingUp className="text-green-400" size={16} />
                        </div>
                        <div className="text-2xl font-bold text-green-400">{stats.success_rate}%</div>
                    </div>

                    <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-zinc-400 uppercase">Avg Latency</span>
                            <Clock className="text-yellow-400" size={16} />
                        </div>
                        <div className="text-2xl font-bold text-yellow-400">{stats.avg_latency}s</div>
                    </div>

                    <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-zinc-400 uppercase">Failed</span>
                            <AlertCircle className="text-red-400" size={16} />
                        </div>
                        <div className="text-2xl font-bold text-red-400">{stats.failed_interactions}</div>
                    </div>
                </div>
            )}

            {stats && Object.keys(stats.errors || {}).length > 0 && (
                <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-zinc-300 mb-3">Error Breakdown</h3>
                    <div className="space-y-2">
                        {Object.entries(stats.errors).map(([errorType, count]: [string, any]) => (
                            <div key={errorType} className="flex justify-between items-center text-sm">
                                <span className="text-zinc-400">{errorType}</span>
                                <span className="text-red-400 font-mono">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MonitorDashboard;
