import React, { useState, useEffect } from 'react';
import Hero from './components/Hero';
import ShopSelection from './components/ShopSelection';
import OrderForm from './components/OrderForm';
import { DesignType, GameType, Language, User } from './types';
import { CheckCircleIcon } from './components/Icons';
import { translations } from './utils/translations';
import { auth, loginWithGoogle, logout } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

// View states
type View = 'hero' | 'shop' | 'form' | 'success';

const App = () => {
  const [currentView, setCurrentView] = useState<View>('hero');
  const [orderConfig, setOrderConfig] = useState<{game: GameType, design: DesignType} | null>(null);
  const [language, setLanguage] = useState<Language>('uz');
  const [user, setUser] = useState<User | null>(null);
  
  // Loading states
  const [authChecking, setAuthChecking] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const t = translations[language];

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser({
          uid: currentUser.uid,
          displayName: currentUser.displayName,
          email: currentUser.email,
          photoURL: currentUser.photoURL
        });
      } else {
        setUser(null);
      }
      setAuthChecking(false);
    });

    return () => unsubscribe();
  }, []);

  // Custom Loading Animation Effect (0 to 100%)
  useEffect(() => {
    const timer = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        // Random speed increment for realistic effect
        const increment = Math.floor(Math.random() * 3) + 1;
        return Math.min(prev + increment, 100);
      });
    }, 40);

    return () => clearInterval(timer);
  }, []);

  const handleStart = async () => {
    if (!user) {
      try {
        await loginWithGoogle();
        setCurrentView('shop');
      } catch (error) {
        // Error handling
      }
    } else {
      setCurrentView('shop');
    }
  };

  const handleLogout = async () => {
    await logout();
    setCurrentView('hero');
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

  // Show loading screen if Auth is checking OR Animation is not finished
  if (authChecking || loadingProgress < 100) {
    return (
      <div className="fixed inset-0 bg-[#020205] z-[100] flex flex-col items-center justify-center overflow-hidden font-display">
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-20" 
             style={{
               backgroundImage: 'linear-gradient(rgba(99, 102, 241, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.2) 1px, transparent 1px)',
               backgroundSize: '50px 50px',
               maskImage: 'radial-gradient(circle at center, black 40%, transparent 80%)'
             }}>
        </div>
        
        {/* Giant Background Number */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20vw] font-black text-white/[0.03] select-none pointer-events-none">
          {loadingProgress}%
        </div>

        <div className="relative z-10 flex flex-col items-center w-full max-w-lg px-6">
           {/* Logo / Text */}
           <div className="mb-12 relative">
             <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase relative z-10">
               Elbek <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-primary to-cyber-accent">Productions</span>
             </h1>
             <div className="absolute -inset-2 bg-cyber-primary/20 blur-xl opacity-50 rounded-full"></div>
           </div>
           
           {/* Progress Container */}
           <div className="w-full relative">
             {/* Percentage Text */}
             <div className="flex justify-between items-end mb-2 text-cyber-primary font-mono text-sm tracking-widest uppercase">
               <span>
                 {loadingProgress < 30 ? 'System Boot...' : 
                  loadingProgress < 60 ? 'Loading Assets...' : 
                  loadingProgress < 90 ? 'Connecting...' : 'Ready'}
               </span>
               <span className="font-bold text-white text-xl">{loadingProgress}%</span>
             </div>

             {/* Progress Bar */}
             <div className="h-2 w-full bg-white/5 rounded-none overflow-hidden border border-white/10 relative">
               {/* Filled Part */}
               <div 
                 className="h-full bg-gradient-to-r from-cyber-primary via-indigo-500 to-cyber-accent relative shadow-[0_0_15px_rgba(99,102,241,0.8)]"
                 style={{ width: `${loadingProgress}%`, transition: 'width 0.1s linear' }}
               >
                 {/* Shine effect on bar */}
                 <div className="absolute right-0 top-0 h-full w-2 bg-white/50 blur-[2px]"></div>
               </div>
             </div>

             {/* Bottom Deco */}
             <div className="flex justify-between mt-2 opacity-40">
               <div className="h-1 w-1 bg-cyber-primary"></div>
               <div className="h-1 w-full mx-2 bg-white/10"></div>
               <div className="h-1 w-1 bg-cyber-primary"></div>
             </div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans antialiased text-white min-h-screen">
      {currentView === 'hero' && (
        <Hero 
          onStart={handleStart} 
          language={language}
          setLanguage={setLanguage}
          user={user}
          onLogout={handleLogout}
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
          user={user}
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