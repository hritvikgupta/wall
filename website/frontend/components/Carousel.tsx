import React from 'react';
import { LucideIcon } from 'lucide-react';

interface CarouselItem {
  title: string;
  description: string;
  icon: LucideIcon;
}

interface CarouselProps {
  title: string;
  subtitle: string;
  items: CarouselItem[];
  layout?: 'carousel' | 'grid';
}

const Carousel: React.FC<CarouselProps> = ({ title, subtitle, items, layout = 'carousel' }) => {
  return (
    <div className="py-24 border-t border-white/5 overflow-hidden">
      <div className="mb-12 px-1">
        <div className="font-mono text-xs text-blue-500 tracking-widest uppercase mb-4">
          {subtitle}
        </div>
        <h2 className="text-3xl md:text-4xl font-mono font-bold text-white tracking-tight">
          {title}
        </h2>
      </div>

      {layout === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="bg-surface border border-white/5 p-8 rounded-xl hover:border-blue-500/50 transition-all duration-300 group cursor-default hover:bg-white/5 h-full flex flex-col"
            >
              <div className="w-12 h-12 bg-[#222] rounded-lg flex items-center justify-center text-white mb-6 group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-colors border border-white/5 group-hover:border-blue-500/20">
                <item.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-mono font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">{item.title}</h3>
              <p className="text-muted font-mono text-xs leading-relaxed flex-1">{item.description}</p>
            </div>
          ))}
        </div>
      ) : (
        /* Hide scrollbar but allow functionality */
        <div className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory -mx-6 px-6 md:mx-0 md:px-0">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="snap-center shrink-0 w-[280px] md:w-[320px] bg-surface border border-white/5 p-8 rounded-lg hover:border-blue-500/50 transition-all duration-300 group cursor-default"
            >
              <div className="w-12 h-12 bg-[#222] rounded-lg flex items-center justify-center text-white mb-6 group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-colors border border-white/5 group-hover:border-blue-500/20">
                <item.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-mono font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">{item.title}</h3>
              <p className="text-muted font-mono text-xs leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Carousel;