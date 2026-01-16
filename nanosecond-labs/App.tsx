import React, { useState } from 'react';
import { Header } from './components/Header';
import { MainHero } from './components/MainHero';
import { SidebarContent } from './components/SidebarContent';
import { Products } from './components/Products';
import { Footer } from './components/Footer';
import { ProductDetail } from './components/ProductDetail';

type ViewState = 'home' | 'llm-wall' | 'chytr';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('home');

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateTo = (newView: ViewState) => {
    setView(newView);
    handleScrollTop();
  };

  return (
    <div className="min-h-screen w-full bg-ns-paper flex justify-center">
      {/* Main Container - Max width constraint, no shadow, no texture, flat background */}
      <div className="w-full max-w-7xl min-h-screen flex flex-col border-x border-ns-ink/5">
        
        {view === 'home' ? (
          <>
            <Header />
            <main className="px-8 md:px-12 pb-12 flex-grow">
              <MainHero />
              <SidebarContent />
              <Products onNavigate={navigateTo} />
            </main>
          </>
        ) : (
          <ProductDetail productId={view} onBack={() => navigateTo('home')} />
        )}

        <Footer />
      </div>
    </div>
  );
};

export default App;