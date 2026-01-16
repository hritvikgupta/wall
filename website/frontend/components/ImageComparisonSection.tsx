import React from 'react';
import { CheckCircle2, XCircle, Code2 } from 'lucide-react';

const ImageComparisonSection: React.FC = () => {
    return (
        <div className="w-full py-24 border-t border-white/5 bg-background relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2"></div>
                <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl -translate-y-1/2"></div>
            </div>

            <div className="max-w-6xl mx-auto px-6 md:px-12 relative z-10">
                <div className="flex flex-col gap-12 lg:gap-16">

                    {/* Top: Text Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-end">
                        <div className="max-w-xl">
                            <div className="text-blue-500 font-mono text-xs tracking-widest uppercase mb-4">Visual Reasoning</div>
                            <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                                See why content gets <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-red-400">Accepted or Rejected.</span>
                            </h2>
                        </div>
                        <div className="max-w-xl lg:text-left">
                            <p className="text-muted text-sm md:text-base font-mono leading-relaxed lg:pl-8 border-l border-white/10">
                                LLMWall doesn't just block blindly. It understands context.
                                Our Vision LLM integration analyzes every pixel against your specific domain rules
                                to make intelligent decisions.
                            </p>
                        </div>
                    </div>

                    {/* Bottom: Visual Comparison */}
                    <div className="w-full">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center justify-items-center">
                            {/* card 1: Accepted */}
                            <div className="group relative rounded-2xl overflow-hidden border border-green-500/20 bg-green-500/5 h-[400px] w-full max-w-md transition-all hover:-translate-y-2 duration-500 shadow-lg shadow-green-500/5">
                                <div className="absolute top-0 left-0 w-full bg-green-900/40 backdrop-blur-sm border-b border-green-500/20 py-2 px-4 flex justify-between items-center z-20">
                                    <span className="text-[10px] uppercase font-mono text-green-300">DOCUMENTATION EXAMPLE: MEDICAL IMAGE SPECIFICATION</span>
                                </div>
                                <div className="absolute top-12 left-4 z-20 flex items-center gap-2 bg-green-500 text-black px-3 py-1 rounded-full text-xs font-bold font-mono shadow-lg">
                                    <CheckCircle2 size={14} /> ACCEPTED
                                </div>
                                <div className="absolute top-16 right-4 left-4 bottom-24 p-4 flex items-center justify-center">
                                    <img
                                        src="/valid_medical_xray.png"
                                        alt="Valid medical X-Ray"
                                        className="rounded-lg shadow-2xl object-cover h-full w-full opacity-90 group-hover:opacity-100 transition-opacity"
                                    />
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity pointer-events-none"></div>
                                <div className="absolute bottom-0 left-0 w-full p-4 border-t border-white/10 bg-black/60 backdrop-blur-md">
                                    <p className="font-mono text-[10px] text-green-300 uppercase mb-1">Reason</p>
                                    <p className="font-mono text-xs text-white">Matches medical context guidelines.</p>
                                </div>
                            </div>

                            {/* card 2: Rejected */}
                            <div className="group relative rounded-2xl overflow-hidden border border-red-500/20 bg-red-500/5 h-[400px] w-full max-w-md transition-all hover:-translate-y-2 duration-500 shadow-lg shadow-red-500/5">
                                <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold font-mono shadow-lg">
                                    <XCircle size={14} /> REJECTED
                                </div>
                                <div className="absolute top-12 right-4 left-4 bottom-24 p-4 flex items-center justify-center">
                                    <img
                                        src="/blurred_rejected_content.png"
                                        alt="Blurred flagged content"
                                        className="rounded-lg shadow-2xl object-cover h-full w-full grayscale contrast-125 opacity-80 group-hover:opacity-100 transition-opacity"
                                    />
                                </div>
                                <div className="absolute inset-0 bg-red-900/10 mix-blend-overlay pointer-events-none"></div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity pointer-events-none"></div>
                                <div className="absolute bottom-0 left-0 w-full p-4 border-t border-white/10 bg-black/60 backdrop-blur-md">
                                    <p className="font-mono text-[10px] text-red-300 uppercase mb-1">Reason</p>
                                    <p className="font-mono text-xs text-white">Off-topic content detected.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ImageComparisonSection;
