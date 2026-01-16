import React from 'react';

interface FeatureSectionProps {
  title: string;
  features: string[];
  description: string;
  visual: React.ReactNode;
  align?: 'left' | 'right';
  indexString: string;
}

const FeatureSection: React.FC<FeatureSectionProps> = ({ 
  title, 
  features, 
  description, 
  visual, 
  align = 'left',
  indexString 
}) => {
  return (
    <div className="py-24 border-t border-white/5">
      <div className={`flex flex-col md:flex-row gap-12 md:gap-24 items-center ${align === 'right' ? 'md:flex-row-reverse' : ''}`}>
        
        {/* Text Content */}
        <div className="flex-1 space-y-8">
          <div className="font-mono text-xs text-blue-500 tracking-widest uppercase">
            {indexString}
          </div>
          
          <h2 className="text-3xl md:text-4xl font-mono font-bold text-white tracking-tight">
            {title}
          </h2>
          
          <p className="font-mono text-muted text-sm leading-7">
            {description}
          </p>

          <ul className="space-y-3 font-mono text-sm text-gray-300">
            {features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="text-blue-500 mt-1">▹</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Visual Content */}
        <div className="flex-1 w-full">
          {visual}
        </div>
      </div>
    </div>
  );
};

export default FeatureSection;