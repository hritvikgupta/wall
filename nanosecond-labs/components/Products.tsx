import React from 'react';

interface ProductsProps {
  onNavigate: (page: string) => void;
}

export const Products: React.FC<ProductsProps> = ({ onNavigate }) => {
  return (
    <section className="mt-16 border-t-4 border-double border-ns-ink pt-8">
      {/* Section Header */}
      <div className="flex items-center gap-4 mb-8">
        <h3 className="font-sans font-bold text-xl md:text-2xl uppercase tracking-[0.2em] whitespace-nowrap">
          Department of Defense
        </h3>
        <div className="h-px bg-ns-ink w-full relative">
            <span className="absolute right-0 -top-2 text-[10px] font-mono uppercase bg-ns-paper pl-2">
                Classified: Top Secret
            </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-2 border-ns-ink bg-ns-ink">
        
        {/* Product 1: LLM Wall Dev */}
        <div className="bg-ns-paper p-1 mr-[2px] mb-[2px] md:mb-0">
            <div className="h-full border border-ns-ink p-6 flex flex-col group hover:bg-neutral-100 transition-colors">
                <div className="flex justify-between items-start mb-4 border-b border-ns-ink pb-2">
                    <h4 className="font-serif font-black text-3xl">LLM Wall<span className="text-sm align-top ml-1 font-sans font-normal opacity-60">dev</span></h4>
                    <span className="font-mono text-[10px] border border-ns-ink px-1 pt-0.5">FIG 2.A</span>
                </div>
                
                <div className="mb-4 relative h-32 w-full bg-neutral-200 overflow-hidden grayscale">
                    {/* Abstract architectural texture */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] opacity-20"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-24 border-x-4 border-ns-ink"></div>
                        <div className="absolute w-24 h-px bg-ns-ink rotate-45"></div>
                        <div className="absolute w-24 h-px bg-ns-ink -rotate-45"></div>
                    </div>
                </div>

                <p className="font-sans text-[10px] font-bold uppercase tracking-widest mb-2 text-ns-ink/70">
                    Perimeter Defense System
                </p>
                
                <p className="font-body text-sm leading-relaxed mb-6 flex-grow">
                    The ultimate barrier for your cognitive architecture. LLM Wall Dev sanitizes inputs and neutralizes prompt injections before they reach the core processor. Essential for maintaining the integrity of experimental language models in development environments.
                </p>

                <div className="mt-auto pt-4 border-t border-dashed border-ns-ink flex justify-between items-center">
                    <span className="font-mono text-xs">v1.0.4-beta</span>
                    <button 
                        onClick={() => onNavigate('llm-wall')}
                        className="bg-ns-ink text-ns-paper font-sans font-bold text-xs uppercase px-4 py-2 hover:bg-neutral-700 transition-colors cursor-pointer">
                        Inspect
                    </button>
                </div>
            </div>
        </div>

        {/* Product 2: Chytr */}
        <div className="bg-ns-paper p-1">
             <div className="h-full border border-ns-ink p-6 flex flex-col group hover:bg-neutral-100 transition-colors">
                <div className="flex justify-between items-start mb-4 border-b border-ns-ink pb-2">
                    <h4 className="font-serif font-black text-3xl">Chytr</h4>
                    <span className="font-mono text-[10px] border border-ns-ink px-1 pt-0.5">FIG 2.B</span>
                </div>

                <div className="mb-4 relative h-32 w-full bg-neutral-200 overflow-hidden grayscale">
                     {/* Organic texture for Chytr */}
                     <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                     <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full border-2 border-ns-ink animate-pulse"></div>
                        <div className="absolute w-20 h-20 rounded-full border border-ns-ink opacity-50"></div>
                        <div className="absolute w-28 h-28 rounded-full border border-dashed border-ns-ink opacity-30"></div>
                     </div>
                </div>

                <p className="font-sans text-[10px] font-bold uppercase tracking-widest mb-2 text-ns-ink/70">
                    Adaptive Immune Response
                </p>

                <p className="font-body text-sm leading-relaxed mb-6 flex-grow">
                    Like a biological organism, Chytr spreads through your network to detect anomalies in real-time. It evolves with the threat landscape, identifying hallucinated outputs and adversarial patterns with nanosecond latency.
                </p>

                <div className="mt-auto pt-4 border-t border-dashed border-ns-ink flex justify-between items-center">
                    <span className="font-mono text-xs">Status: Active</span>
                    <button 
                        onClick={() => onNavigate('chytr')}
                        className="bg-ns-ink text-ns-paper font-sans font-bold text-xs uppercase px-4 py-2 hover:bg-neutral-700 transition-colors cursor-pointer">
                        Deploy
                    </button>
                </div>
            </div>
        </div>

      </div>
      
      <p className="text-center font-sans text-[9px] uppercase tracking-wider mt-2 opacity-60">
        * Authorized personnel only. Specifications subject to change without notice.
      </p>
    </section>
  );
};