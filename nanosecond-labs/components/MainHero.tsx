import React from 'react';

export const MainHero: React.FC = () => {
  return (
    <section className="pt-8 md:pt-12 pb-8 text-center">
      {/* Massive Headline */}
      <h1 className="font-serif font-black text-5xl md:text-7xl lg:text-8xl text-ns-ink leading-[0.9] tracking-tighter mb-6 uppercase scale-y-90 transform">
        As We Secure AI
      </h1>

      {/* Sub-deck */}
      <div className="max-w-2xl mx-auto mb-4">
        <h2 className="font-sans font-bold text-sm md:text-lg uppercase tracking-widest leading-relaxed text-ns-ink">
          A Top U.S. Security Firm foresees a possible future world in which man-made machines will start to be safeguarded
        </h2>
      </div>

      {/* Byline */}
      <div className="flex flex-col items-center justify-center gap-2 mb-8">
        <p className="font-sans font-bold text-xs uppercase tracking-widest">by NANOSECOND LABS</p>
        <p className="font-sans text-[10px] uppercase text-ns-ink/70">Director of the Office of Scientific Research and Development</p>
        <p className="font-sans text-[10px] italic text-ns-ink/60">Condensed from the Nanosecond Monthly, July 2024</p>
      </div>

      {/* Decorative separator */}
      <div className="w-16 h-1 bg-ns-ink mx-auto rounded-full mb-8"></div>
    </section>
  );
};