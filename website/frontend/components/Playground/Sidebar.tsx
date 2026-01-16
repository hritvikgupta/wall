import React from 'react';
import {
    Shield,
    CheckSquare,
    AlertTriangle,
    Brain,
    Database,
    BarChart3,
    Activity,
    FileText,
    TrendingUp,
    MessageSquare,
    ChevronRight,
    Lightbulb
} from 'lucide-react';

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
    const sections = [
        {
            title: 'Core Components',
            description: 'Main library features',
            items: [
                { id: 'guard', label: 'Wall Guard', icon: Shield, description: 'Multi-validator validation engine' },
                { id: 'validators', label: 'Validators', icon: CheckSquare, description: 'Custom validation rules' },
                { id: 'onfail-actions', label: 'OnFail Actions', icon: AlertTriangle, description: 'Failure handling strategies' },
                { id: 'context-manager', label: 'Context Manager', icon: Brain, description: 'NLP-based context filtering' },
                { id: 'rag', label: 'RAG Retriever', icon: Database, description: 'Knowledge grounding' },
                { id: 'scorer', label: 'Response Scorer', icon: BarChart3, description: 'Quality metrics' },
            ]
        },
        {
            title: 'Monitoring & Logging',
            description: 'Track and analyze',
            items: [
                { id: 'monitor', label: 'LLM Monitor', icon: Activity, description: 'Tracking & analytics' },
                { id: 'logger', label: 'Wall Logger', icon: FileText, description: 'Comprehensive logging' },
                { id: 'visualization', label: 'Visualization', icon: TrendingUp, description: 'Visual analytics' },
            ]
        },
        {
            title: 'Testing',
            description: 'Test with LLM',
            items: [
                { id: 'chat', label: 'Chat Playground', icon: MessageSquare, description: 'Test all components together' },
            ]
        }
    ];

    return (
        <div className="w-72 h-full bg-[#13120b] flex flex-col border-r border-white/5 overflow-y-auto">
            {/* Header */}
            <div className="px-4 py-4 border-b border-white/5">
                <h2 className="text-sm font-bold text-[#d7d6d5]">Wall Library Playground</h2>
                <p className="text-[10px] text-[#888888] mt-1">Test and configure all components</p>
            </div>

            {/* Sections */}
            <div className="flex-1 p-3 space-y-4">
                {sections.map((section, idx) => (
                    <div key={idx}>
                        <div className="px-2 mb-2">
                            <div className="text-[10px] text-[#888888] font-semibold uppercase tracking-wider">
                                {section.title}
                            </div>
                            <div className="text-[9px] text-[#666666]">
                                {section.description}
                            </div>
                        </div>
                        <div className="space-y-0.5">
                            {section.items.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group ${activeTab === item.id
                                        ? 'bg-white/10 border border-white/10 text-[#d7d6d5]'
                                        : 'text-[#888888] hover:text-[#d7d6d5] hover:bg-white/5'
                                        }`}
                                >
                                    <item.icon
                                        size={16}
                                        strokeWidth={2}
                                        className={activeTab === item.id ? 'text-[#d7d6d5]' : 'text-[#888888] group-hover:text-[#d7d6d5]'}
                                    />
                                    <div className="flex-1 text-left">
                                        <span className={`block text-xs font-medium ${activeTab === item.id ? 'text-[#d7d6d5]' : ''}`}>
                                            {item.label}
                                        </span>
                                        <span className="block text-[9px] text-[#666666] group-hover:text-[#888888]">
                                            {item.description}
                                        </span>
                                    </div>
                                    {activeTab === item.id && (
                                        <ChevronRight size={12} className="text-[#d7d6d5]" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* User Profile / Help Section */}
            <div className="p-4 border-t border-white/5">
                <div className="bg-[#1E1E1C] border border-white/10 rounded-lg p-3">
                    <p className="text-[10px] text-[#888888] leading-relaxed flex items-start gap-1">
                        <Lightbulb size={12} className="text-[#d7d6d5] shrink-0 mt-0.5" />
                        <span>
                            <strong className="text-[#d7d6d5]">Tip:</strong> Configure components in their sections,
                            then use <strong>Chat Playground</strong> to test them all together with a real LLM!
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
