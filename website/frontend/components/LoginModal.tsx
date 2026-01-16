import React, { useState } from 'react';
import { Shield, Loader2, Mail, Lock, User, Building } from 'lucide-react';
import { neonService } from '../services/neon';

interface LoginModalProps {
    isOpen: boolean;
    onLoginSuccess: (user: { name: string; org: string; id: string; email: string }) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onLoginSuccess }) => {
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [name, setName] = useState('');
    const [org, setOrg] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (mode === 'signup' && !name.trim()) {
            setError('Name is required');
            return;
        }
        if (!email.trim() || !password.trim()) {
            setError('Email and password are required');
            return;
        }

        setLoading(true);
        try {
            let user;
            if (mode === 'signup') {
                user = await neonService.createUser(name, org, email, password);
            } else {
                user = await neonService.loginUser(email, password);
            }

            if (user) {
                const userData = { ...user, org: user.org || '' };
                localStorage.setItem('wall_user', JSON.stringify(userData));
                onLoginSuccess(userData);
            } else {
                setError(mode === 'signup' ? "Failed to create account" : "Invalid credentials");
            }
        } catch (err) {
            console.error("Auth error", err);
            setError("An error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="w-full max-w-[340px] p-6 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl relative">
                <div className="flex flex-col items-center mb-6">
                    <div className="p-2 bg-white/5 rounded-lg mb-3 border border-white/5">
                        <Shield className="w-4 h-4 text-white/80" />
                    </div>
                    <h2 className="text-base font-bold text-white tracking-tight font-sans">
                        {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p className="text-zinc-500 text-[10px] mt-1 text-center font-mono">
                        {mode === 'login' ? 'Enter credentials to continue.' : 'Sign up to start chatting.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                    {mode === 'signup' && (
                        <>
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase tracking-wider font-mono text-zinc-500 ml-1">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Alice Smith"
                                    className="w-full px-3 py-2 bg-white/5 border border-white/5 rounded-lg focus:border-white/20 outline-none text-white text-xs placeholder-zinc-700 font-mono transition-all"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase tracking-wider font-mono text-zinc-500 ml-1">
                                    Organization <span className="text-zinc-700">(Opt)</span>
                                </label>
                                <input
                                    type="text"
                                    value={org}
                                    onChange={(e) => setOrg(e.target.value)}
                                    placeholder="Acme Corp"
                                    className="w-full px-3 py-2 bg-white/5 border border-white/5 rounded-lg focus:border-white/20 outline-none text-white text-xs placeholder-zinc-700 font-mono transition-all"
                                />
                            </div>
                        </>
                    )}

                    <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-wider font-mono text-zinc-500 ml-1">
                            Email
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="alice@example.com"
                            className="w-full px-3 py-2 bg-white/5 border border-white/5 rounded-lg focus:border-white/20 outline-none text-white text-xs placeholder-zinc-700 font-mono transition-all"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-wider font-mono text-zinc-500 ml-1">
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-3 py-2 bg-white/5 border border-white/5 rounded-lg focus:border-white/20 outline-none text-white text-xs placeholder-zinc-700 font-mono transition-all"
                        />
                    </div>

                    {error && (
                        <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-md text-red-400 text-[10px] text-center font-mono">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 bg-white hover:bg-zinc-200 text-black font-bold text-xs rounded-lg shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all mt-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin w-3 h-3" /> Processing...
                            </>
                        ) : (
                            mode === 'login' ? "Sign In" : "Create Account"
                        )}
                    </button>

                    <div className="text-center mt-2">
                        <button
                            type="button"
                            onClick={() => {
                                setMode(mode === 'login' ? 'signup' : 'login');
                                setError('');
                            }}
                            className="text-[10px] text-zinc-500 hover:text-white transition-colors font-mono uppercase tracking-wider"
                        >
                            {mode === 'login' ? "Create an account" : "Sign In to account"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginModal;
