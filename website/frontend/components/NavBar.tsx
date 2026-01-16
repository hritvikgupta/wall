import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Github } from 'lucide-react';

const NavBar: React.FC = () => {
  const location = useLocation();
  const isDocumentation = location.pathname === '/documentation';

  return (
    <nav className="flex justify-between items-center py-6 font-mono text-xs tracking-widest text-muted uppercase">
      <Link to="/" className="flex items-center gap-1 hover:text-white transition-colors group">
        <img src="/favicon.png" alt="LLMWall" className="h-8 w-auto opacity-90 group-hover:opacity-100 transition-opacity" />
        <div className="flex items-baseline gap-2">
          <span className="text-white font-bold tracking-tight">LLMWall</span>
          <span className="text-gray-600">/</span>
          <span className="font-mono text-xs text-muted">v0.1.1</span>
        </div>
      </Link>
      <ul className="flex gap-8">
        {!isDocumentation && (
          <li><a href="#features" className="hover:text-white cursor-pointer transition-colors">Features</a></li>
        )}
        {/* <li>
          <Link
            to="/ask-ai"
            className="flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 text-blue-300 hover:text-white hover:border-blue-400 transition-all shadow-[0_0_10px_rgba(59,130,246,0.2)]"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Ask AI
          </Link>
        </li> */}
        <li>
          <Link
            to="/guardrails"
            className="hover:text-white cursor-pointer transition-colors"
          >
            Guardrails
          </Link>
        </li>
        <li>
          <Link
            to="/documentation"
            className={`hover:text-white cursor-pointer transition-colors ${isDocumentation ? 'text-white' : ''
              }`}
          >
            Documentation
          </Link>
        </li>
        <li>
          <a
            href="https://github.com/hritvikgupta/wall.git"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-white cursor-pointer transition-colors text-white"
          >
            <Github className="w-4 h-4" />
            <span>GitHub</span>
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;