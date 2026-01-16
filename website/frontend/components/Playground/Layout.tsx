import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    MoreHorizontal,
    ArrowRightLeft, // Compare
    Zap, // Optimize
    PlayCircle, // Evaluate
    PenLine // Draft
} from 'lucide-react'; // Using icons that resemble the reference

import Sidebar from './Sidebar';
import ConfigurationPanel from './ConfigurationPanel';
import PreviewPanel from './PreviewPanel';
import { PlaygroundConfig } from '../../types';

const PlaygroundLayout: React.FC = () => {
    const [activeTab, setActiveTab] = useState('chat');
    const [config, setConfig] = useState<PlaygroundConfig>({
        guard: {
            validators: [],
            num_reasks: 0,
            name: '',
        },
        context: {
            keywords: [],
            approved_contexts: [],
            threshold: 0.7,
        },
        rag: {
            top_k: 5,
            collection_name: 'playground_collection',
            embedding_provider: 'sentence-transformers',
            embedding_model_name: 'all-MiniLM-L6-v2',
        },
        scorer: {
            metrics: ['CosineSimilarityMetric', 'SemanticSimilarityMetric'],
            threshold: 0.7,
            aggregation: 'weighted_average',
            weights: {},
        },
        validator: {
            validator_type: 'test_length',
            validator_params: { min_length: 10, max_length: 1000 },
            on_fail: 'exception',
        },
    });
    const navigate = useNavigate();

    // Redirect if not logged in (retained logic)
    useEffect(() => {
        if (!localStorage.getItem('wall_user')) {
            navigate('/login');
        }
    }, [navigate]);

    // Initialize config when switching tabs
    useEffect(() => {
        // Ensure config has default values for the active tab
        setConfig(prev => {
            const updated = { ...prev };

            if (activeTab === 'guard' && !updated.guard) {
                updated.guard = { validators: [], num_reasks: 0, name: '' };
            }
            if (activeTab === 'context-manager' && !updated.context) {
                updated.context = { keywords: [], approved_contexts: [], threshold: 0.7 };
            }
            if (activeTab === 'rag' && !updated.rag) {
                updated.rag = { top_k: 5, collection_name: 'playground_collection', embedding_provider: 'sentence-transformers' };
            }
            if (activeTab === 'scorer' && !updated.scorer) {
                updated.scorer = { metrics: ['CosineSimilarityMetric', 'SemanticSimilarityMetric'], threshold: 0.7, aggregation: 'weighted_average', weights: {} };
            }
            if (activeTab === 'validators' && !updated.validator) {
                updated.validator = { validator_type: 'test_length', validator_params: { min_length: 10, max_length: 1000 }, on_fail: 'exception' };
            }
            if (activeTab === 'logger' && !updated.logger) {
                updated.logger = { level: 'INFO', scopes: ['all'], output: 'both', format: 'both', log_file: 'logs/wall_library.log' };
            }
            if (activeTab === 'monitor' && !updated.monitor) {
                updated.monitor = { enable_telemetry: true, track_latency: true, track_metadata: true };
            }

            return updated;
        });
    }, [activeTab]);

    return (
        <div className="flex h-screen bg-[#13120b] text-[#d7d6d5] overflow-hidden font-sans">

            {/* 1. Left Sidebar - Navigation */}
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Main Content Area (Cols 2 & 3) */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* Top Header Row */}
                <header className="h-14 bg-[#13120b] border-b border-white/5 flex items-center justify-between px-4 shrink-0">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/')}
                            className="text-[#888888] hover:text-white transition-colors"
                            title="Back to Home"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div className="flex items-center gap-2">
                            <h1 className="font-semibold text-[#d7d6d5]">New prompt</h1>
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#1E1E1C] border border-white/10 rounded text-[10px] text-[#888888] font-medium cursor-pointer hover:border-white/20">
                                <PenLine size={10} />
                                <span>Draft</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="p-2 text-[#888888] hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                            <MoreHorizontal size={18} />
                        </button>

                        <button className="flex items-center gap-2 px-3 py-1.5 text-xs text-[#888888] hover:text-white hover:bg-white/5 rounded-lg transition-colors font-medium">
                            <ArrowRightLeft size={14} />
                            <span>Compare</span>
                        </button>

                        <button className="flex items-center gap-2 px-3 py-1.5 text-xs text-[#888888] hover:text-white hover:bg-white/5 rounded-lg transition-colors font-medium">
                            <Zap size={14} />
                            <span>Optimize</span>
                        </button>

                        <button className="flex items-center gap-2 px-3 py-1.5 text-xs text-[#888888] hover:text-white hover:bg-white/5 rounded-lg transition-colors font-medium opacity-50 cursor-not-allowed">
                            <PlayCircle size={14} />
                            <span>Evaluate</span>
                        </button>

                        <button className="ml-2 px-4 py-1.5 bg-white text-black text-xs font-semibold rounded-lg hover:bg-gray-200 transition-colors">
                            Save
                        </button>
                    </div>
                </header>

                {/* 2 & 3. Config + Preview Grid */}
                <div className="flex-1 flex min-h-0">
                    {/* Middle Column - Configuration */}
                    <div className="w-[450px] shrink-0 h-full border-r border-white/5">
                        <ConfigurationPanel
                            activeTool={activeTab}
                            config={config}
                            onConfigChange={setConfig}
                        />
                    </div>

                    {/* Right Column - Preview/Chat */}
                    <div className="flex-1 h-full min-w-0">
                        <PreviewPanel
                            activeTool={activeTab}
                            config={config}
                        />
                    </div>
                </div>
            </div>

        </div>
    );
};

export default PlaygroundLayout;
