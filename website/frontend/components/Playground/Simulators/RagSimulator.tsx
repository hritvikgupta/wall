import React, { useState } from 'react';
import { Database, Search, FileText } from 'lucide-react';
import apiClient, { RAGRetrieveRequest } from '../../../services/api';
import { RAGConfig } from '../../../types';

interface RagSimulatorProps {
    config?: RAGConfig;
}

const RagSimulator: React.FC<RagSimulatorProps> = ({ config }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [searched, setSearched] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async () => {
        if (!query.trim()) return;
        setSearched(true);
        setIsLoading(true);
        setError(null);

        try {
            const request: RAGRetrieveRequest = {
                query: query,
                rag_id: config?.rag_id || 'default',
                top_k: config?.top_k || 5,
                collection_name: config?.collection_name || 'playground_collection',
            };

            const response = await apiClient.retrieveRAG(request);
            setResults(response.results.map((r, idx) => ({
                id: idx + 1,
                text: r.document,
                score: r.score,
            })));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Database className="text-orange-500" /> RAG Retriever
                </h2>
                <p className="text-zinc-400 mt-2">
                    Simulate context retrieval from a vector database. See how the system selects relevant knowledge chunks.
                </p>
            </div>

            {/* Search Bar */}
            <div className="relative mb-12">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="text-zinc-500" size={20} />
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Query the knowledge base (e.g., 'What is Wall Guard?')"
                    className="w-full pl-12 pr-4 py-4 bg-zinc-900 border border-white/10 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 outline-none text-white text-lg placeholder-zinc-600 transition-all shadow-xl"
                />
                <button
                    onClick={handleSearch}
                    disabled={isLoading || !query.trim()}
                    className="absolute right-2 top-2 bottom-2 px-6 bg-orange-600 hover:bg-orange-500 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Retrieving...' : 'Retrieve'}
                </button>
            </div>

            {/* Results */}
            <div className="space-y-6">
                {error && (
                    <div className="bg-red-950/20 border border-red-500/30 rounded-xl p-4">
                        <p className="text-red-400 text-sm">{error}</p>
                    </div>
                )}
                {isLoading ? (
                    <div className="text-center py-12 text-zinc-500">
                        Retrieving documents...
                    </div>
                ) : searched && results.length > 0 ? (
                    <div>
                        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">Top {results.length} Retrieved Chunks</h3>
                        <div className="grid gap-4">
                            {results.map((item, idx) => (
                                <div key={item.id} className="bg-zinc-900/50 border border-white/5 rounded-xl p-5 hover:border-orange-500/30 transition-colors group">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <FileText size={16} className="text-orange-400" />
                                            <span className="text-xs font-mono text-zinc-400">doc_id_{item.id}</span>
                                        </div>
                                        <div className="px-2 py-1 bg-orange-500/10 text-orange-400 text-xs font-mono rounded border border-orange-500/20">
                                            Score: {item.score}
                                        </div>
                                    </div>
                                    <p className="text-zinc-300 leading-relaxed group-hover:text-white transition-colors">
                                        {item.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : searched ? (
                    <div className="text-center py-12 text-zinc-500">
                        No relevant documents found.
                    </div>
                ) : (
                    <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-xl">
                        <div className="inline-block p-4 rounded-full bg-zinc-900 mb-4">
                            <Database className="text-zinc-600" size={32} />
                        </div>
                        <p className="text-zinc-500">Enter a query to inspect retrieval results</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RagSimulator;
