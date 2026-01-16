import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';

const Login: React.FC = () => {
    const [name, setName] = useState('');
    const [org, setOrg] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            // Mock login - store session
            localStorage.setItem('wall_user', JSON.stringify({ name, org }));
            navigate('/playground');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
            {/* Background decorations - similar to Landing */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl opacity-20 animate-pulse"></div>
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl opacity-20"></div>
            </div>

            <div className="w-full max-w-md p-8 bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
                <div className="flex flex-col items-center mb-8">
                    <div className="p-3 bg-blue-500/10 rounded-xl mb-4 border border-blue-500/20">
                        <Shield className="w-8 h-8 text-blue-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Welcome to Wall</h1>
                    <p className="text-zinc-400 text-sm mt-2 text-center">
                        Sign in to access the playground and simulate library capabilities.
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium text-zinc-300 ml-1">
                            Full Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Alice Smith"
                            className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none text-white placeholder-zinc-600 transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="org" className="text-sm font-medium text-zinc-300 ml-1">
                            Organization <span className="text-zinc-600 font-normal">(Optional)</span>
                        </label>
                        <input
                            id="org"
                            type="text"
                            value={org}
                            onChange={(e) => setOrg(e.target.value)}
                            placeholder="e.g. Acme Corp"
                            className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none text-white placeholder-zinc-600 transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium rounded-xl shadow-lg shadow-blue-900/20 transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.98]"
                    >
                        Enter Playground
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-white/5 text-center">
                    <p className="text-xs text-zinc-500">
                        This is a simulation environment. No actual backend connection is required.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
