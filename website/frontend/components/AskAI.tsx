import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Plus, MessageSquare, Code, FileText, Loader2, Database, Terminal, Mic, LogOut } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { neonService, Session, Message } from '../services/neon';
import { searchService } from '../services/search';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-python';

import LoginModal from './LoginModal';

const AskAI: React.FC = () => {
    const [user, setUser] = useState<{ name: string; org: string; id: string; email?: string } | null>(null);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'readme' | 'code'>('readme');
    const [showLoginModal, setShowLoginModal] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initial Load - Check User & Fetch Sessions
    useEffect(() => {
        const storedUser = localStorage.getItem('wall_user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            // Verify we have a valid ID (new flow requirement)
            if (parsedUser.id) {
                setUser(parsedUser);
                loadSessions(parsedUser.id);
            } else {
                // Old session data without ID - force re-login
                localStorage.removeItem('wall_user');
                setShowLoginModal(true);
            }
        } else {
            setShowLoginModal(true);
        }
    }, []);

    const handleLoginSuccess = (userData: { name: string; org: string; id: string; email?: string }) => {
        setUser(userData);
        setShowLoginModal(false);
        // Start fresh with no sessions or empty list
        setSessions([]);
    };

    const handleLogout = () => {
        localStorage.removeItem('wall_user');
        setUser(null);
        setSessions([]);
        setMessages([]);
        setCurrentSessionId(null);
        setShowLoginModal(true);
    };

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        Prism.highlightAll();
    }, [messages, activeTab]);

    const loadSessions = async (userId: string) => {
        const sessionsData = await neonService.getSessions(userId);
        setSessions(sessionsData);
    };

    const handleNewSession = () => {
        setCurrentSessionId(null);
        setMessages([]);
        setInputValue('');
    };

    const handleLoadSession = async (sessionId: string) => {
        setCurrentSessionId(sessionId);
        const msgs = await neonService.getMessages(sessionId);
        setMessages(msgs);
    };

    const handleSend = async () => {
        if (!inputValue.trim() || !user) return;

        const query = inputValue;
        setInputValue('');
        setLoading(true);

        try {
            let sessionId = currentSessionId;

            // Create session if first message
            if (!sessionId) {
                // Ensure we have user ID (should handle type safety but 'user' check above covers basic existence)
                if (!user?.id) {
                    console.error("User ID missing");
                    return;
                }
                const newSession = await neonService.createSession(user.id, query.substring(0, 30) + '...');
                if (newSession) {
                    sessionId = newSession.id;
                    setCurrentSessionId(sessionId);
                    setSessions([newSession, ...sessions]);
                }
            }

            if (sessionId) {
                // Add User Message
                const userMsg = await neonService.addMessage(sessionId, 'user', query, 'text');
                if (userMsg) setMessages(prev => [...prev, userMsg]);

                // Search Documentation
                const result = await searchService.searchDocumentation(query);

                // Add Assistant REsponse (Readme)
                // await neonService.addMessage(sessionId, 'assistant', result.readme, 'text');

                // Store combined content for mixed display
                const combinedContent = JSON.stringify({ readme: result.readme, code: result.code });
                const aiMsg = await neonService.addMessage(sessionId, 'assistant', combinedContent, 'mixed');

                if (aiMsg) setMessages(prev => [...prev, aiMsg]);
            }

        } catch (error) {
            console.error("Error in chat loop:", error);
        } finally {
            setLoading(false);
        }
    };

    const isHomeState = !currentSessionId && messages.length === 0;

    return (
        <div className="flex h-screen bg-[#0a0a0a] text-white font-sans overflow-hidden">
            <LoginModal
                isOpen={showLoginModal}
                onLoginSuccess={handleLoginSuccess}
            />
            {/* Sidebar */}
            <aside className="w-64 flex-shrink-0 bg-[#050505] border-r border-white/5 flex flex-col hidden md:flex">
                <div className="p-4 border-b border-white/5">
                    <button
                        onClick={handleNewSession}
                        className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/5 rounded-lg transition-all text-xs font-mono uppercase tracking-wider"
                    >
                        <Plus size={14} />
                        <span>New Chat</span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    <p className="px-2 py-2 text-[10px] font-mono text-zinc-600 uppercase tracking-widest">History</p>
                    {sessions.map(session => (
                        <button
                            key={session.id}
                            onClick={() => handleLoadSession(session.id)}
                            className={`w-full flex items-center gap-3 p-2.5 text-xs rounded-lg transition-colors text-left ${currentSessionId === session.id ? 'bg-white/5 text-white' : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300'
                                }`}
                        >
                            <MessageSquare size={14} className="shrink-0" />
                            <span className="truncate">{session.title}</span>
                        </button>
                    ))}
                </div>

                <div className="p-4 border-t border-white/5">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-6 h-6 rounded bg-gradient-to-tr from-zinc-700 to-zinc-600 flex items-center justify-center text-[10px] font-bold shrink-0">
                                {user?.name.charAt(0)}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-xs text-zinc-300 truncate">{user?.name}</p>
                                <p className="text-[10px] text-zinc-600 truncate">{user?.email || user?.org}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-1.5 text-zinc-500 hover:text-white hover:bg-white/5 rounded-md transition-colors"
                            title="Sign Out"
                        >
                            <LogOut size={14} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col relative w-full">

                {/* Header / Empty State */}
                {isHomeState && user && (
                    <div className="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center animate-in fade-in duration-700 w-full px-4">
                        <div className="mb-8 text-center">
                            <h2 className="text-2xl md:text-3xl font-sans font-medium text-[#d7d6d5]">
                                Good to see you, {user.name.split(' ')[0]}.
                            </h2>
                        </div>
                    </div>
                )}

                {/* Messages Area */}
                <div className={`flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth pb-32 ${isHomeState ? 'hidden' : ''}`}>
                    <div className="max-w-3xl mx-auto space-y-6">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.role === 'assistant' && (
                                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-1">
                                        <Terminal size={14} className="text-zinc-400" />
                                    </div>
                                )}

                                <div className={`max-w-2xl ${msg.role === 'user' ? 'bg-[#2f2f2f] text-white' : 'bg-transparent w-full'}`}>
                                    {msg.role === 'user' ? (
                                        <div className="px-5 py-3 rounded-2xl bg-[#2f2f2f] text-[#ececec] text-sm leading-relaxed">
                                            {msg.content}
                                        </div>
                                    ) : (
                                        <div className="bg-[#0a0a0a] border border-white/5 rounded-xl overflow-hidden">
                                            {/* Tabs for Assistant Response */}
                                            {msg.type === 'mixed' ? (() => {
                                                const content = JSON.parse(msg.content);
                                                return (
                                                    <>
                                                        <div className="flex border-b border-white/5 bg-white/[0.02]">
                                                            <button
                                                                onClick={() => setActiveTab('readme')}
                                                                className={`px-4 py-2 text-[10px] font-mono uppercase tracking-wider flex items-center gap-2 transition-colors ${activeTab === 'readme' ? 'bg-white/5 text-white border-b border-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                                                            >
                                                                <FileText size={12} /> Readme
                                                            </button>
                                                            <button
                                                                onClick={() => setActiveTab('code')}
                                                                className={`px-4 py-2 text-[10px] font-mono uppercase tracking-wider flex items-center gap-2 transition-colors ${activeTab === 'code' ? 'bg-white/5 text-white border-b border-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                                                            >
                                                                <Code size={12} /> Code
                                                            </button>
                                                        </div>
                                                        <div className="p-6 overflow-x-auto overflow-y-auto max-h-[400px] scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                                                            {activeTab === 'readme' ? (
                                                                <div className="prose prose-invert prose-sm max-w-none prose-headings:font-sans prose-p:text-zinc-400 prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10">
                                                                    <ReactMarkdown>{content.readme}</ReactMarkdown>
                                                                </div>
                                                            ) : (
                                                                <pre className="!bg-transparent !m-0 !p-0">
                                                                    <code className="language-python text-sm font-mono leading-relaxed text-zinc-300">
                                                                        {content.code || "# No code snippet available."}
                                                                    </code>
                                                                </pre>
                                                            )}
                                                        </div>
                                                    </>
                                                );
                                            })() : (
                                                <div className="p-4 text-zinc-300 text-sm">
                                                    {msg.content}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                                    <Loader2 size={14} className="text-zinc-400 animate-spin" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Input Area - Conditional Placement */}
                <div className={`absolute w-full px-4 transition-all duration-500 ${isHomeState ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-8 max-w-2xl' : 'bottom-0 left-0 p-6 bg-gradient-to-t from-black/80 via-black to-transparent z-10'}`}>
                    <div className={`${isHomeState ? 'w-full' : 'max-w-3xl mx-auto'}`}>
                        <div className="relative bg-[#1e1e1e] rounded-[24px] overflow-hidden shadow-2xl ring-1 ring-white/5 transition-all">
                            <div className="flex items-center px-4 py-3 gap-3">
                                <button className="p-2 text-zinc-400 hover:text-white transition-colors rounded-full hover:bg-white/5">
                                    <Plus size={20} />
                                </button>

                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Ask anything"
                                    className="flex-1 bg-transparent border-none outline-none text-[#ececec] placeholder-zinc-500 text-base h-10 font-sans"
                                    autoFocus
                                />

                                {isHomeState && (
                                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-transparent hover:bg-white/5 rounded-full transition-colors border border-dashed border-zinc-700">
                                        <Loader2 size={12} className="text-zinc-500" />
                                        <span className="text-xs text-zinc-500 font-mono">Thinking</span>
                                    </button>
                                )}

                                <button className="p-2 text-zinc-400 hover:text-white transition-colors rounded-full hover:bg-white/5">
                                    <Mic size={20} />
                                </button>

                                <button
                                    onClick={handleSend}
                                    disabled={loading || !inputValue.trim()}
                                    className={`p-2 rounded-full transition-all duration-200 ${inputValue.trim() ? 'bg-blue-600 text-white' : 'bg-[#2f2f2f] text-zinc-500'}`}
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
};

export default AskAI;
