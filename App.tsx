import React, { useState } from 'react';
import Hero from './components/Hero';
import ShopSelection from './components/ShopSelection';
import OrderForm from './components/OrderForm';
import { DesignType, GameType, Language } from './types';
import { CheckCircleIcon } from './components/Icons';
import { translations } from './utils/translations';

// View states
type View = 'hero' | 'shop' | 'form' | 'success';

const App = () => {
  const [currentView, setCurrentView] = useState<View>('hero');
  const [orderConfig, setOrderConfig] = useState<{game: GameType, design: DesignType} | null>(null);
  const [language, setLanguage] = useState<Language>('uz');

  const t = translations[language];

  const handleStart = () => {
    setCurrentView('shop');
  };

  const handleShopSelection = (game: GameType, design: DesignType) => {
    setOrderConfig({ game, design });
    setCurrentView('form');
  };

  const handleBackToShop = () => {
    setCurrentView('shop');
  };

  const handleBackToHero = () => {
    setCurrentView('hero');
  };

  const handleSuccess = () => {
    setCurrentView('success');
  };

  const resetApp = () => {
    setOrderConfig(null);
    setCurrentView('hero');
  };

  return (
    <div className="font-sans antialiased text-white min-h-screen">
      {currentView === 'hero' && (
        <Hero 
          onStart={handleStart} 
          language={language}
          setLanguage={setLanguage}
        />
      )}
      
      {currentView === 'shop' && (
        <ShopSelection 
          onNext={handleShopSelection} 
          onBack={handleBackToHero}
          language={language}
        />
      )}

      {currentView === 'form' && orderConfig && (
        <OrderForm 
          selectedGame={orderConfig.game}
          selectedDesign={orderConfig.design}
          onBack={handleBackToShop}
          onSuccess={handleSuccess}
          language={language}
        />
      )}

      {currentView === 'success' && (
        <div className="min-h-screen flex items-center justify-center px-4 animate-fade-in relative z-50">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-md -z-10"></div>
          <div className="glass-card p-10 rounded-3xl text-center max-w-md border border-green-500/30 shadow-[0_0_50px_rgba(34,197,94,0.2)]">
            <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20">
              <CheckCircleIcon className="w-12 h-12 text-green-500 drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
            </div>
            <h2 className="text-4xl font-display font-bold text-white mb-4">{t.successTitle}</h2>
            <p className="text-gray-300 mb-8 leading-relaxed">
              {t.successText}
            </p>
            <button
              onClick={resetApp}
              className="w-full py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-all border border-white/10"
            >
              {t.homeBtn}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;