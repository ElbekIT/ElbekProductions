
import React, { useState, useEffect } from 'react';
import Hero from './components/Hero';
import ShopSelection from './components/ShopSelection';
import OrderForm from './components/OrderForm';
import MyOrders from './components/MyOrders';
import AdminPanel from './components/AdminPanel';
import LocationVerifier from './components/LocationVerifier';
import IntroLoader from './components/IntroLoader';
import { DesignType, GameType, Language, User, VerifiedLocation } from './types';
import { CheckCircleIcon, LoaderIcon, AlertCircleIcon } from './components/Icons';
import { translations } from './utils/translations';
import { auth, loginWithGoogle, logout, getUserBanStatus, syncUserProfile } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

// View states
type View = 'hero' | 'location-verify' | 'shop' | 'form' | 'success' | 'my-orders' | 'admin' | 'banned';

const App = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [currentView, setCurrentView] = useState<View>('hero');
  const [orderConfig, setOrderConfig] = useState<{game: GameType, design: DesignType} | null>(null);
  const [language, setLanguage] = useState<Language>('uz');
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [verifiedLocation, setVerifiedLocation] = useState<VerifiedLocation | null>(null);

  const t = translations[language];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Sync basic profile to DB for Admin
        await syncUserProfile({
           uid: currentUser.uid,
           displayName: currentUser.displayName,
           email: currentUser.email,
           photoURL: currentUser.photoURL
        });

        // Check for ban immediately
        const banStatus = await getUserBanStatus(currentUser.uid);
        if (banStatus.isBanned) {
          setUser({
            uid: currentUser.uid,
            displayName: currentUser.displayName,
            email: currentUser.email,
            photoURL: currentUser.photoURL
          });
          setCurrentView('banned');
          await logout(); // Ensure they are logged out of session even if banned
          setAuthLoading(false);
          return;
        }

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
    });

    return () => unsubscribe();
  }, []);

  const handleStart = async () => {
    if (!user) {
      try {
        await loginWithGoogle();
        // Ban check handles redirection in useEffect
      } catch (error) {
        // Error handling if needed
      }
    } else {
      if (currentView !== 'banned') {
         // FLOW: Hero -> Location Verify -> Shop
         setCurrentView('location-verify');
      }
    }
  };

  const handleLocationVerified = (loc: VerifiedLocation) => {
    setVerifiedLocation(loc);
    setCurrentView('shop');
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
  
  const handleBackToVerify = () => {
    setCurrentView('location-verify');
  };

  const handleBackToHero = () => {
    setCurrentView('hero');
  };

  const handleSuccess = () => {
    setCurrentView('success');
  };
  
  const handleMyOrders = () => {
    if(currentView !== 'banned') setCurrentView('my-orders');
  }

  const handleAdminPanel = () => {
    if(currentView !== 'banned') setCurrentView('admin');
  }
  
  const handleBan = () => {
    setCurrentView('banned');
  }

  const resetApp = () => {
    setOrderConfig(null);
    setCurrentView('hero');
  };

  // 1. Show Cinematic Intro first
  if (showIntro) {
    return <IntroLoader onFinish={() => setShowIntro(false)} />;
  }

  // 2. Then show Auth Loader if firebase is still thinking (usually instant after intro)
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#020205] flex flex-col items-center justify-center relative overflow-hidden z-[100]">
        <div className="absolute inset-0 bg-grid-pattern opacity-30"></div>
        <div className="relative z-10 flex flex-col items-center justify-center">
           <LoaderIcon className="w-16 h-16 text-cyber-primary animate-spin" />
           <p className="mt-4 font-mono text-[10px] text-cyber-primary uppercase tracking-widest animate-pulse">
             System Initializing...
           </p>
        </div>
      </div>
    );
  }

  if (currentView === 'banned') {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center z-[200] relative overflow-hidden">
         <div className="absolute inset-0 bg-red-900/20 animate-pulse"></div>
         <AlertCircleIcon className="w-32 h-32 text-red-600 mb-8 drop-shadow-[0_0_20px_rgba(220,38,38,0.8)]" />
         <h1 className="text-6xl md:text-8xl font-black text-red-600 mb-6 tracking-tighter">BANNED</h1>
         <div className="bg-red-950/80 border border-red-500 p-8 max-w-2xl backdrop-blur-md rounded-xl">
           <p className="text-xl md:text-2xl text-white font-bold uppercase leading-relaxed font-display">
             {t.banMessage}
           </p>
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
      
      {currentView === 'location-verify' && user && (
        <LocationVerifier
          user={user}
          language={language}
          onVerified={handleLocationVerified}
          onBack={handleBackToHero}
          onBan={handleBan}
        />
      )}
      
      {currentView === 'shop' && (
        <ShopSelection 
          onNext={handleShopSelection} 
          onBack={handleBackToVerify}
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
