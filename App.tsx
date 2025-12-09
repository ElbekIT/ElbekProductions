import React, { useState, useEffect } from 'react';
import Hero from './components/Hero';
import ShopSelection from './components/ShopSelection';
import OrderForm from './components/OrderForm';
import MyOrders from './components/MyOrders';
import AdminPanel from './components/AdminPanel';
import { DesignType, GameType, Language, User } from './types';
import { CheckCircleIcon, LoaderIcon } from './components/Icons';
import { translations } from './utils/translations';
import { auth, loginWithGoogle, logout } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

// View states
type View = 'hero' | 'shop' | 'form' | 'success' | 'my-orders' | 'admin';

const App = () => {
  const [currentView, setCurrentView] = useState<View>('hero');
  const [orderConfig, setOrderConfig] = useState<{game: GameType, design: DesignType} | null>(null);
  const [language, setLanguage] = useState<Language>('uz');
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const t = translations[language];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      // Small delay to show off the new loading animation
      setTimeout(() => {
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
        setAuthLoading(false);
      }, 2000);
    });

    return () => unsubscribe();
  }, []);

  const handleStart = async () => {
    if (!user) {
      try {
        await loginWithGoogle();
        // After successful login, move to shop
        setCurrentView('shop');
      } catch (error) {
        // Error handling if needed
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
  
  const handleMyOrders = () => {
    setCurrentView('my-orders');
  }

  const handleAdminPanel = () => {
    setCurrentView('admin');
  }

  const resetApp = () => {
    setOrderConfig(null);
    setCurrentView('hero');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#020205] flex flex-col items-center justify-center relative overflow-hidden z-[100]">
        {/* Background Grids */}
        <div className="absolute inset-0 bg-grid-pattern opacity-30"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyber-primary to-transparent animate-pulse"></div>

        <div className="relative z-10 flex flex-col items-center justify-center">
           {/* Animated Logo Construction */}
           <div className="relative w-32 h-32 mb-10">
              <div className="absolute inset-0 border-2 border-cyber-primary/20 rounded-full"></div>
              <div className="absolute inset-0 border-t-2 border-cyber-primary rounded-full animate-spin-slow"></div>
              <div className="absolute inset-4 border-b-2 border-cyber-accent rounded-full animate-spin-reverse"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-16 h-16 bg-cyber-primary/10 backdrop-blur-sm rounded-lg border border-cyber-primary/50 flex items-center justify-center rotate-45 animate-pulse-fast">
                    <span className="font-display font-bold text-2xl text-white -rotate-45">EP</span>
                 </div>
              </div>
           </div>

           {/* Brand Text */}
           <div className="text-center space-y-2">
             <h1 className="font-display text-4xl md:text-5xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-cyber-primary to-white animate-pulse">
               ELBEK
             </h1>
             <h2 className="font-display text-xl md:text-2xl font-bold tracking-[0.3em] text-cyber-accent/80">
               PRODUCTIONS
             </h2>
           </div>

           {/* Loading Bar */}
           <div className="mt-12 w-64 h-1 bg-gray-900/50 rounded-full overflow-hidden border border-white/10 relative">
              <div className="absolute inset-0 bg-cyber-primary/50 blur-[4px] animate-[pulse_1s_ease-in-out_infinite]"></div>
              <div className="h-full bg-gradient-to-r from-transparent via-cyber-primary to-transparent w-[50%] animate-[slide_1.5s_ease-in-out_infinite_alternate]" style={{ animation: 'scan 2s linear infinite, pulse 0.5s ease-in-out infinite' }}></div>
           </div>
           
           <div className="mt-4 flex flex-col items-center gap-1">
             <p className="font-mono text-[10px] text-cyber-primary uppercase tracking-widest animate-pulse">
               System Initializing...
             </p>
             <p className="font-mono text-[9px] text-gray-600">
               v2.0.4 - SECURE
             </p>
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
          onMyOrders={handleMyOrders}
          onAdmin={handleAdminPanel}
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
      
      {currentView === 'my-orders' && user && (
        <MyOrders
          user={user}
          language={language}
          onBack={handleBackToHero}
        />
      )}

      {currentView === 'admin' && (
        <AdminPanel
          language={language}
          onBack={handleBackToHero}
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
            <div className="flex flex-col gap-3">
               <button
                 onClick={() => {
                   resetApp();
                   if(user) setCurrentView('my-orders');
                 }}
                 className="w-full py-4 bg-cyber-primary/20 hover:bg-cyber-primary/40 text-cyber-primary hover:text-white rounded-xl font-bold transition-all border border-cyber-primary/50"
               >
                 {t.myOrdersBtn}
               </button>
               <button
                 onClick={resetApp}
                 className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/10"
               >
                 {t.homeBtn}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;