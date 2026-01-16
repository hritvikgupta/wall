import React from 'react';
import { ArrowRight, Terminal, Box } from 'lucide-react';
import CodeCard from './CodeCard';

const Hero: React.FC = () => {
   const heroCode = `def create_healthcare_wall(persist_directory: str = None):
    # ========================================
    # 1. GUARD - Input/Output Validation
    # ========================================
    guard = WallGuard()
    
    # Add safety validator (blocks restricted terms)
    guard.use((
        HealthcareSafetyValidator,
        {"restricted_terms": HEALTHCARE_RESTRICTED_TERMS},
        OnFailAction.EXCEPTION
    ))
    
    # ========================================
    # 2. NLP CONTEXT MANAGER
    # ========================================
    context_manager = ContextManager(keywords=set(HEALTHCARE_KEYWORDS))
    context_manager.add_string_list(HEALTHCARE_APPROVED_CONTEXTS)

    return guard, context_manager`;

   return (
      <section className="relative pt-4 pb-12 md:pt-8 md:pb-32 px-4 md:px-8 max-w-7xl mx-auto">
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left Column: Text & CTA */}
            <div className="flex flex-col items-start select-none z-20">
               <h1 className="text-6xl md:text-7xl lg:text-8xl leading-[0.9] font-bold tracking-tighter font-sans">
                  <span className="block text-[#d7d6d5] pb-2">
                     Prompt.
                  </span>
                  <span className="block text-[#d7d6d5]">
                     Guard.
                  </span>
                  <span className="block text-[#d7d6d5]">
                     Deploy.
                  </span>
               </h1>

               <p className="font-mono text-base md:text-lg text-muted leading-relaxed max-w-lg mt-8">
                  Upgrade your LLM stack. <br className="hidden md:block" />
                  Integrate validation processes to encourage deterministic outputs and increase quality.
               </p>

               <div className="flex flex-col sm:flex-row gap-6 mt-10 w-full md:w-auto">
                  <button className="group flex items-center justify-center gap-3 bg-[#EDEDED] hover:bg-white text-black border border-white/10 px-6 py-4 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]" onClick={() => navigator.clipboard.writeText('pip install wall-library')}>
                     <Terminal className="w-5 h-5" />
                     <span className="font-mono text-xs font-bold whitespace-nowrap">pip install wall-library</span>
                     <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                  </button>

                  <a href="https://test.pypi.org/project/wall-library/0.1.0/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl border border-white/10 hover:bg-white/5 transition-colors text-white font-mono text-xs font-bold">
                     <Box className="w-5 h-5" />
                     <span>View on PyPI</span>
                  </a>
               </div>
            </div>

            {/* Right Column: Layered Visual */}
            <div className="relative z-10 w-full max-w-2xl mx-auto lg:ml-auto perspective-1000">
               {/* Artistic Background Layer */}
               <div className="absolute -inset-10 rounded-3xl overflow-hidden opacity-80">
                  <img src="/hero-bg.png" alt="Background Texture" className="w-full h-full object-cover blur-sm scale-110" />
                  <div className="absolute inset-0 bg-black/20 mix-blend-multiply"></div>
               </div>

               {/* Code Editor Layer */}
               <div className="relative">
                  <CodeCard
                     title="healthcare_test.py"
                     code={heroCode}
                     input="Validation check..."
                     output="Passed: True"
                     className="shadow-2xl shadow-black/50 border-white/5"
                     showSidebar={false}
                     showOutput={false}
                  />
               </div>
            </div>
         </div>


      </section >
   );
};

export default Hero;