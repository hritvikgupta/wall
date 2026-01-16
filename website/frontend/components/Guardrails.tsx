import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { guardrails } from '../data/guardrails';
import { Search, Shield, Filter, ArrowRight } from 'lucide-react';

const Guardrails: React.FC = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState<string | null>(null);

    const types = Array.from(new Set(guardrails.map(g => g.type)));

    const filteredGuardrails = guardrails.filter(g => {
        const matchesSearch = g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            g.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = selectedType ? g.type === selectedType : true;
        return matchesSearch && matchesType;
    });

    return (
        <div className="min-h-screen bg-background text-text pb-20 font-sans">
            <div className="max-w-7xl mx-auto px-6 md:px-12 pt-8">

                <div className="flex flex-col md:flex-row gap-8 relative">

                    {/* Fixed Sidebar / Filters */}
                    {/* Using fixed positioning to guarantee it stays in view */}
                    <div className="hidden md:block w-64 fixed top-28 bottom-0 overflow-y-auto hide-scrollbar z-20 pb-20">
                        <div className="space-y-8">
                            <div>
                                <h1 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-text" />
                                    Guardrails
                                </h1>

                                <div className="relative mb-6">
                                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted" />
                                    <input
                                        type="text"
                                        placeholder="Filter by name..."
                                        className="w-full bg-transparent border border-white/10 rounded-md pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-white/30 transition-colors placeholder:text-muted text-text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xs font-bold text-muted uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Filter className="h-3 w-3" /> Type
                                </h3>
                                <div className="space-y-1">
                                    <button
                                        onClick={() => setSelectedType(null)}
                                        className={`w-full text-left px-3 py-1.5 rounded-md text-xs transition-colors flex justify-between items-center ${selectedType === null
                                                ? 'bg-white/10 text-white font-medium'
                                                : 'text-muted hover:text-text hover:bg-white/5'
                                            }`}
                                    >
                                        <span>All</span>
                                        <span className="text-[10px] opacity-60">{guardrails.length}</span>
                                    </button>
                                    {types.map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setSelectedType(type)}
                                            className={`w-full text-left px-3 py-1.5 rounded-md text-xs transition-colors flex justify-between items-center ${selectedType === type
                                                    ? 'bg-white/10 text-white font-medium'
                                                    : 'text-muted hover:text-text hover:bg-white/5'
                                                }`}
                                        >
                                            <span>{type}</span>
                                            <span className="text-[10px] opacity-60">{guardrails.filter(g => g.type === type).length}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Sidebar (Static) */}
                    <div className="md:hidden w-full space-y-6 mb-8">
                        <div>
                            <h1 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <Shield className="h-5 w-5 text-text" />
                                Guardrails
                            </h1>
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted" />
                                <input
                                    type="text"
                                    placeholder="Filter by name..."
                                    className="w-full bg-transparent border border-white/10 rounded-md pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-white/30 transition-colors placeholder:text-muted text-text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Main Grid with Left Margin to clear Fixed Sidebar */}
                    <div className="flex-1 min-w-0 md:pl-72">
                        {/* Sticky Header for Count */}
                        <div className="sticky top-[72px] z-30 bg-background/95 backdrop-blur-md py-4 border-b border-white/5 mb-6 -mx-4 px-4">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-muted">
                                    Showing <span className="text-text font-semibold">{filteredGuardrails.length}</span> guardrails
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3">
                            {filteredGuardrails.map(guardrail => (
                                <div
                                    key={guardrail.id}
                                    onClick={() => navigate(`/guardrails/${guardrail.id}`)}
                                    className="group relative bg-[#1c1c1a] border border-white/5 rounded-lg p-4 hover:border-white/20 transition-all cursor-pointer overflow-hidden flex flex-col h-full"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="text-sm font-bold text-text group-hover:text-white group-hover:underline decoration-white/30 underline-offset-4 transition-colors">
                                            {guardrail.name}
                                        </h3>
                                        <span className="text-[10px] font-mono text-muted border border-white/5 px-1.5 py-0.5 rounded capitalize">
                                            {guardrail.type}
                                        </span>
                                    </div>

                                    <p className="text-muted text-xs leading-relaxed mb-4 line-clamp-2 flex-grow">
                                        {guardrail.description}
                                    </p>

                                    <div className="flex items-center justify-between mt-auto">
                                        <div className="flex flex-wrap gap-1.5">
                                            {guardrail.tags.slice(0, 3).map(tag => (
                                                <span key={tag} className="text-[10px] text-muted bg-white/5 px-1.5 py-0.5 rounded">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="text-muted opacity-0 group-hover:opacity-100 transition-opacity text-[10px] flex items-center gap-1">
                                            View <ArrowRight className="h-3 w-3" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {filteredGuardrails.length === 0 && (
                            <div className="text-center py-20 bg-white/5 rounded-lg border border-white/5 border-dashed">
                                <p className="text-muted text-sm">No guardrails found matching your criteria.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Guardrails;
