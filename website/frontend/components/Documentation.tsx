import React, { useState, useEffect } from 'react';
import CodeCard from './CodeCard';

// Wrapper component for code cards with background styling
const CodeCardWrapper: React.FC<{
  title: string;
  code: string;
  input: string;
  output: string;
  showSidebar?: boolean;
  showOutput?: boolean;
  isFail?: boolean;
}> = ({ title, code, input, output, showSidebar = false, showOutput = true, isFail = false }) => {
  return (
    <div className="relative w-full perspective-1000 my-16">
      {/* Artistic Background Layer */}
      <div className="absolute -inset-10 rounded-3xl overflow-hidden opacity-80">
        <img src="/hero-bg.png" alt="Background Texture" className="w-full h-full object-cover blur-sm scale-110" />
        <div className="absolute inset-0 bg-black/20 mix-blend-multiply"></div>
      </div>
      {/* Code Editor Layer */}
      <div className="relative">
        <CodeCard
          title={title}
          code={code}
          input={input}
          output={output}
          showSidebar={showSidebar}
          showOutput={showOutput}
          isFail={isFail}
          className="shadow-2xl shadow-black/50 border-white/5"
        />
      </div>
    </div>
  );
};

interface DocumentationContent {
  id: string;
  title: string;
  description: string;
  content: Array<{
    type: string;
    content?: string;
    title?: string;
    code?: string;
    input?: string;
    output?: string;
    items?: string[];
    src?: string;
    alt?: string;
    caption?: string;
    subsections?: Array<{
      title: string;
      type: string;
      content?: string;
      code?: string;
      input?: string;
      output?: string;
      items?: string[];
      src?: string;
      alt?: string;
      caption?: string;
    }>;
  }>;
}

const Documentation: React.FC = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [sectionData, setSectionData] = useState<DocumentationContent | null>(null);
  const [loading, setLoading] = useState(true);

  const tableOfContents = [
    { id: 'overview', title: 'Overview' },
    { id: 'key-features', title: 'Key Features' },
    { id: 'installation', title: 'Installation' },
    { id: 'quick-start', title: 'Quick Start' },
    { id: 'wall-guard', title: 'Wall Guard' },
    { id: 'validators', title: 'Validators' },
    { id: 'onfail-actions', title: 'OnFailActions' },
    { id: 'context-manager', title: 'Context Manager' },
    { id: 'image-context-manager', title: 'Image Context Manager' },
    { id: 'rag-retriever', title: 'RAG Retriever' },
    { id: 'response-scorer', title: 'Response Scorer' },
    { id: 'llm-monitor', title: 'LLM Monitor' },
    { id: 'wall-logger', title: 'Wall Logger' },
    { id: 'visualization', title: 'Visualization' },
    { id: 'schema-systems', title: 'Schema Systems' },
    { id: 'framework-wrappers', title: 'Framework Wrappers' },
    { id: 'streaming-async', title: 'Streaming & Async' },
    { id: 'complete-examples', title: 'Complete Examples' },
    { id: 'architecture', title: 'Architecture' },
  ];

  // Load section data when activeSection changes
  useEffect(() => {
    const loadSection = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/documentation/${activeSection}.json`);
        if (!response.ok) {
          throw new Error('Failed to load documentation');
        }
        const data = await response.json();
        setSectionData(data);
      } catch (error) {
        console.error('Error loading documentation:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSection();
  }, [activeSection]);

  const renderContent = (content: DocumentationContent['content'][0]) => {
    switch (content.type) {
      case 'text':
        return (
          <p className="text-muted font-mono leading-relaxed mb-5" dangerouslySetInnerHTML={{ __html: content.content?.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>') || '' }} />
        );

      case 'code':
        return (
          <CodeCardWrapper
            title={content.title || 'code.py'}
            code={content.code || ''}
            input={content.input || ''}
            output={content.output || ''}
            showSidebar={false}
            showOutput={false}
          />
        );

      case 'image':
        return (
          <div className="my-8 rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-[#0a0a0a]">
            {content.src && (
              <img
                src={content.src}
                alt={content.alt || 'Documentation Image'}
                className="w-full h-auto object-cover"
              />
            )}
            {content.caption && (
              <div className="p-3 bg-white/5 border-t border-white/5">
                <p className="text-xs font-mono text-center text-muted">{content.caption}</p>
              </div>
            )}
          </div>
        );

      case 'list':
        return (
          <ul className="text-muted font-mono text-sm space-y-2 mb-4 list-disc list-inside">
            {content.items?.map((item, idx) => (
              <li key={idx} dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>') }} />
            ))}
          </ul>
        );

      case 'section':
        return (
          <div className="mb-10">
            <h3 className="text-xl font-bold text-white mb-5 font-sans">{content.title}</h3>
            {content.subsections?.map((subsection, idx) => (
              <div key={idx} className="mb-6 scroll-mt-20" id={`subsection-${idx}`}>
                <h4 className="text-lg font-bold text-white mb-4 font-sans">{subsection.title}</h4>
                {subsection.type === 'text' && (
                  <p className="text-muted font-mono leading-relaxed mb-2" dangerouslySetInnerHTML={{ __html: subsection.content?.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>') || '' }} />
                )}
                {subsection.type === 'code' && (
                  <CodeCardWrapper
                    title={subsection.title || 'code.py'}
                    code={subsection.code || ''}
                    input={subsection.input || ''}
                    output={subsection.output || ''}
                    showSidebar={false}
                    showOutput={false}
                  />
                )}
                {subsection.type === 'list' && (
                  <ul className="text-muted font-mono text-sm space-y-2 mb-3 list-disc list-inside">
                    {subsection.items?.map((item, itemIdx) => (
                      <li key={itemIdx} dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>') }} />
                    ))}
                  </ul>
                )}
                {subsection.type === 'image' && (
                  <div className="my-4 rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-[#0a0a0a]">
                    {subsection.src && (
                      <img
                        src={subsection.src}
                        alt={subsection.alt || 'Documentation Image'}
                        className="w-full h-auto object-cover"
                      />
                    )}
                    {subsection.caption && (
                      <div className="p-3 bg-white/5 border-t border-white/5">
                        <p className="text-xs font-mono text-center text-muted">{subsection.caption}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background text-text">
      {/* Background Layer - Same as Hero */}
      <div className="absolute inset-0 bg-background pointer-events-none -z-10"></div>

      <div className="flex relative">
        <aside className="w-64 shrink-0 bg-[#1b1913] border-r border-white/10 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto py-6 px-4 hidden lg:block">
          <h2 className="text-xs font-mono uppercase tracking-wider text-gray-500 mb-6">Table of Contents</h2>
          <nav className="space-y-1">
            {tableOfContents.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`block w-full text-left px-3 py-2 text-xs font-mono rounded transition-colors ${activeSection === item.id
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                {item.title}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 min-w-0">
          <div className="max-w-4xl mx-auto px-6 md:px-12 py-8">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-muted font-mono">Loading documentation...</p>
              </div>
            ) : sectionData ? (
              <>
                <div className="mb-8">
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 font-sans tracking-tight">
                    {sectionData.title}
                  </h1>
                  <p className="text-sm text-muted font-mono leading-relaxed">
                    {sectionData.description}
                  </p>
                </div>

                <div>
                  {sectionData.content.map((content, idx) => (
                    <div key={idx} className="mb-6">
                      {renderContent(content)}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-muted font-mono">Documentation not found</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Documentation;
