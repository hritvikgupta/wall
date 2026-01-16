import React, { useEffect, useRef } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-bash';

interface CodeCardProps {
  title: string;
  subtitle?: string;
  code: string;
  input: string;
  output: string;
  isFail?: boolean;
  className?: string;
  showSidebar?: boolean;
  showOutput?: boolean;
  language?: string;
}

const CodeCard: React.FC<CodeCardProps> = ({
  title,
  subtitle,
  code,
  input,
  output,
  isFail = false,
  className = "",
  showSidebar = false,
  showOutput = true,
  language = "python"
}) => {
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [code, language]);

  return (
    <div className={`bg-[#1b1913] border border-white/10 rounded-xl overflow-hidden font-mono shadow-2xl flex flex-col ${className}`}>
      {/* Search/Command Bar Look */}
      <div className="bg-[#1b1913] h-9 border-b border-white/5 flex items-center px-4 justify-between shrink-0">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-[#3d3d3d]"></div>
          <div className="w-3 h-3 rounded-full bg-[#3d3d3d]"></div>
          <div className="w-3 h-3 rounded-full bg-[#3d3d3d]"></div>
        </div>
        <div className="w-10"></div>
      </div>

      <div className="flex flex-1 min-w-0">
        {/* Sidebar Mockup - Only show if showSidebar is true */}
        {showSidebar && (
          <div className="w-64 bg-[#1b1913] border-r border-white/5 p-4 hidden md:flex flex-col gap-6 shrink-0">
            <div>
              <div className="text-[10px] font-bold text-gray-500 mb-3 uppercase tracking-wider flex items-center justify-between">
                <span>EXPLORER</span>
              </div>
              <div className="flex flex-col gap-1.5 font-sans">
                <div className="flex items-center gap-1.5 text-gray-400 group cursor-pointer hover:text-white transition-colors">
                  <div className="w-4 h-4 flex items-center justify-center">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="transform rotate-90"><path d="M8 5v14l11-7z" /></svg>
                  </div>
                  <span className="text-[11px] tracking-wide font-medium">wall-library</span>
                </div>

                <div className="flex flex-col gap-1.5 pl-6 border-l border-white/5 ml-2">
                  <div className="flex items-center gap-2 text-gray-400 group cursor-pointer hover:text-white transition-colors">
                    <div className="w-4 h-4 flex items-center justify-center">
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor" className="transform rotate-90"><path d="M8 5v14l11-7z" /></svg>
                    </div>
                    <span className="text-[11px]">examples</span>
                  </div>

                  {/* File List */}
                  <div className="flex flex-col gap-1.5 pl-5 border-l border-white/5 ml-2">
                    <div className="flex items-center gap-2 text-[#2DD4BF] bg-white/5 py-1 px-2 rounded -ml-2 cursor-pointer">
                      <span className="opacity-80">py</span>
                      <span className="text-[11px]">basic_validation.py</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 hover:text-gray-300 cursor-pointer px-2 -ml-2">
                      <span className="opacity-80">py</span>
                      <span className="text-[11px]">rag_example.py</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 hover:text-gray-300 cursor-pointer px-2 -ml-2">
                      <span className="opacity-80">py</span>
                      <span className="text-[11px]">structured_output.py</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 hover:text-gray-300 cursor-pointer px-2 -ml-2">
                      <span className="opacity-80">py</span>
                      <span className="text-[11px]">langchain_int.py</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-gray-500 mt-1 hover:text-gray-300 cursor-pointer px-2">
                    <span className="text-[11px]">README.md</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col bg-[#1b1913] min-w-0 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-white/5">
            <div className="px-4 py-2 text-[10px] text-gray-300 bg-[#1b1913] border-r border-white/5 flex items-center gap-2">
              <span className="text-blue-400">⚡</span> {title}
            </div>
          </div>
          {/* Code Area with Syntax Highlighting */}
          <div className="flex-1 p-4 overflow-auto">
            <pre className="font-mono leading-relaxed !bg-transparent !m-0 !p-0" style={{ fontSize: '10px' }}>
              <code ref={codeRef} className={`language-${language} !bg-transparent block`} style={{ fontSize: '10px' }}>
                {code}
              </code>
            </pre>
          </div>

          {/* Analysis/Agent Popup Overlay */}
          {showOutput && (
            <div className="mx-6 mb-6 mt-6 max-w-sm ml-auto">
              <div className="bg-[#151515] rounded-xl border border-white/10 shadow-2xl relative mt-4">
                {/* Agent Bubble Tag */}
                <div className="absolute -top-3 left-4 bg-[#151515] px-2 py-0.5 text-[10px] text-blue-400 border border-white/10 rounded-full z-10 font-medium tracking-wide">
                  agent-analysis
                </div>

                <div className={`p-4 pt-5 font-mono text-[11px] leading-relaxed whitespace-pre-wrap ${isFail ? 'text-red-300' : 'text-green-300'}`}>
                  {output}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodeCard;