import React from 'react';

interface HeaderProps {
    title?: string;
    subtitle?: string;
    figCaption?: string;
}

export const LandingHeroHeader: React.FC<HeaderProps> = ({
    title = "Nanosecond Labs",
    subtitle = "Next Gen LLM Security",
    figCaption = "Fig 1. The Analyst [Active]"
}) => {
    // Generate a grid of tiles (12 columns x 8 rows = 96 tiles)
    // We use fixed numbers for simplicity in this visual effect
    const tiles = Array.from({ length: 96 });

    return (
        <div className="w-full text-ns-ink font-sans">
            {/* Masthead - Company Name */}
            <div className="px-8 md:px-12 py-6 flex justify-between items-end border-b-4 border-double border-ns-ink">
                <div className="flex flex-col">
                    <h1 className="font-sans font-black text-3xl md:text-5xl uppercase tracking-tighter leading-none">
                        {title}
                    </h1>
                    <span className="font-mono text-[10px] md:text-xs uppercase tracking-[0.2em] mt-1 text-ns-ink/80">
                        {subtitle}
                    </span>
                </div>
                <div className="hidden md:flex flex-col items-end">
                    <nav className="flex gap-6 font-mono text-[10px] md:text-xs uppercase tracking-widest font-bold mb-2">
                        <a href="https://test.pypi.org/project/wall-library/0.1.1/" target="_blank" rel="noopener noreferrer" className="hover:bg-ns-ink hover:text-ns-paper px-1 -ml-1 transition-colors flex items-center gap-1">
                            pip install wall-library
                        </a>
                        <a href="/guardrails" className="hover:bg-ns-ink hover:text-ns-paper px-1 -ml-1 transition-colors">Guardrails</a>
                        <a href="/documentation" className="hover:bg-ns-ink hover:text-ns-paper px-1 -ml-1 transition-colors">Documentation</a>
                        <a href="https://github.com/hritvikgupta/wall.git" target="_blank" rel="noopener noreferrer" className="hover:bg-ns-ink hover:text-ns-paper px-1 -ml-1 transition-colors flex items-center gap-1">
                            GitHub
                        </a>
                    </nav>
                </div>
            </div>

            {/* Image Area - Placeholder for 'Scientist' */}
            {/* Added 'group' for hover state management */}
            <div className="group w-full h-[300px] md:h-[450px] bg-neutral-900 relative overflow-hidden grayscale contrast-125 cursor-crosshair border-b border-ns-ink">

                {/* Background base (The "Image") */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,_#404040_0%,_#111_60%)] transition-transform duration-700 group-hover:scale-105"></div>

                {/* Noise overlay for vintage photo look */}
                <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIi8+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiMwMDAiLz4KPC9zdmc+')] pointer-events-none"></div>

                {/* Moving Tiles Overlay */}
                <div className="absolute inset-0 grid grid-cols-12 grid-rows-8 z-10">
                    {tiles.map((_, i) => (
                        <div
                            key={i}
                            className="
                  border border-white/0 
                  bg-white/0 
                  relative
                  transition-all duration-500 ease-in-out
                  group-hover:border-white/10 
                  group-hover:bg-white/5 
                  group-hover:scale-[0.95]
                "
                            style={{
                                // Random delay for the 'shimmer' effect to make it look organic
                                transitionDelay: `${Math.random() * 200}ms`
                            }}
                        >
                            {/* Inner 'glitch' block that appears on hover */}
                            <div
                                className="absolute inset-0 bg-white opacity-0 group-hover:animate-pulse"
                                style={{
                                    animationDuration: `${1 + Math.random() * 2}s`,
                                    animationDelay: `${Math.random() * 1}s`
                                }}
                            />
                        </div>
                    ))}
                </div>

                {/* Caption in the corner */}

            </div>

            {/* Caption Strip */}

        </div >
    );
};
