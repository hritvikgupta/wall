import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import NavBar from './components/NavBar';
import Landing from './components/Landing';
import Documentation from './components/Documentation';
import SemanticValidationPost from './components/SemanticValidationPost';
import Login from './components/Login';
import PlaygroundLayout from './components/Playground/Layout';
import Guardrails from './components/Guardrails';
import GuardrailDetail from './components/GuardrailDetail';
import AskAI from './components/AskAI';

const App: React.FC = () => {
  // Basic protection check helper - could be a component but inline is fine for now
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const user = localStorage.getItem('wall_user');
    if (!user) {
      // In a real app we'd redirect via useEffect or Navigate, 
      // but here we can just return Login or null.
      // We'll trust the component to handle redirect for smoother UX or do it here.
      // Actually AskAI component handles it.
      return <>{children}</>;
    }
    return <>{children}</>;
  };

  return (
    <Router>
      <div className="min-h-screen bg-background text-text selection:bg-white/20 selection:text-white">
        <Routes>
          {/* Main Website Routes (with Header) */}
          <Route path="/" element={<Landing />} />

          <Route path="/documentation" element={
            <div className="w-full relative">
              <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-md border-b border-white/10">
                <div className="max-w-6xl mx-auto px-6 md:px-12">
                  <NavBar />
                </div>
              </header>
              <Documentation />
            </div>
          } />

          <Route path="/blog/semantic-validation" element={
            <div className="w-full relative">
              <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-md border-b border-white/10">
                <div className="max-w-6xl mx-auto px-6 md:px-12">
                  <NavBar />
                </div>
              </header>
              <SemanticValidationPost />
            </div>
          } />


          <Route path="/guardrails" element={
            <div className="w-full">
              <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-md border-b border-white/10">
                <div className="max-w-6xl mx-auto px-6 md:px-12">
                  <NavBar />
                </div>
              </header>
              <Guardrails />
            </div>
          } />

          <Route path="/guardrails/:id" element={
            <div className="w-full relative">
              <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-md border-b border-white/10">
                <div className="max-w-6xl mx-auto px-6 md:px-12">
                  <NavBar />
                </div>
              </header>
              <GuardrailDetail />
            </div>
          } />

          {/* New App Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/playground" element={<PlaygroundLayout />} />
          <Route path="/ask-ai" element={<AskAI />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;