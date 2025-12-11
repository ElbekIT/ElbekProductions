
import React, { useState, useEffect } from 'react';
import Hero from './components/Hero';
import ShopSelection from './components/ShopSelection';
import OrderForm from './components/OrderForm';
import MyOrders from './components/MyOrders';
import AdminPanel from './components/AdminPanel';
import TelegramVerifier from './components/TelegramVerifier';
import IntroLoader from './components/IntroLoader';
import { DesignType, GameType, Language, User, VerifiedLocation } from './types';
import { CheckCircleIcon, LoaderIcon, AlertCircleIcon } from './components/Icons';
import { translations } from './utils/translations';
import { auth, loginWithGoogle, logout, getUserBanStatus, syncUserProfile, getUserProfile, getTelegramSession } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

// View states
type View = 'hero' | 'telegram-verify' | 'shop' | 'form' | 'success' | 'my-orders' | 'admin' | 'banned';

const App = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [currentView, setCurrentView] = useState<View>('hero');
  const [orderConfig, setOrderConfig] = useState<{game: GameType, design: DesignType} | null>(null);
  const [language, setLanguage] = useState<Language>('uz');
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const t = translations[language];

  // --- SECURITY PROTOCOLS ---
  useEffect(() => {
    // 1. Disable Right Click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // 2. Disable Keyboard Shortcuts (Ctrl+U, F12, Ctrl+Shift+I, etc.)
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        return false;
      }

      // Ctrl + Shift + I/J/C (DevTools)
      if (e.ctrlKey && e.shiftKey && (['I', 'J', 'C', 'i', 'j', 'c'].includes(e.key))) {
        e.preventDefault();
        return false;
      }

      // Ctrl + U (View Source)
      if (e.ctrlKey && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        return false;
      }

      // Ctrl + S (Save Page)
      if (e.ctrlKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    // 3. Clear Console Warning
    console.clear();
    console.log('%cSTOP!', 'color: red; font-size: 50px; font-weight: bold; text-shadow: 2px 2px black;');
    console.log('%cThis is a secure browser feature.', 'font-size: 20px;');

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // --- AUTH CHECKER ---
  useEffect(() => {
    // 1. Check Google Auth
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        await handleUserLogin({
            uid: currentUser.uid,
            displayName: currentUser.displayName,
            email: currentUser.email,
            photoURL: currentUser.photoURL,
            authMethod: 'google'
        });
      } else {
        // 2. Check Local Telegram Session
        const tgSession = getTelegramSession();
        if (tgSession) {
             await handleUserLogin(tgSession);
        } else {
             setUser(null);
             setAuthLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleUserLogin = async (userData: User) => {
      // Check Ban
      const banStatus = await getUserBanStatus(userData.uid);
      if (banStatus.isBanned) {
          setUser(userData);
          setCurrentView('banned');
          setAuthLoading(false);
          return;
      }

      // Sync Profile to DB
      await syncUserProfile(userData);
      
      // If Google User, check stored Telegram ID
      if (userData.authMethod === 'google') {
          const profile = await getUserProfile(userData.uid);
          setUser({
              ...userData,
              telegramId: profile.telegramId
          });
      } else {
          // Telegram user already has ID in object
          setUser(userData);
      }
      setAuthLoading(false);
  };

  const handleStart = async (method: 'google' | 'telegram') => {
    if (user) {
         // Already Logged In
         if (user.authMethod === 'google' && !user.telegramId) {
             setCurrentView('telegram-verify'); // Add ID to Google account
         } else {
             setCurrentView('shop');
         }
         return;
    }

    if (method === 'google') {
        try {
            await loginWithGoogle();
        } catch (error) {
            // Error handling
        }
    } else {
        // Telegram Login Flow
        setCurrentView('telegram-verify');
    }
  };
  
  // Callback when Telegram Verifier finishes
  const handleTelegramVerified = (telegramId: string, newUser?: User) => {
    if (newUser) {
        // This was a registration/login of a Telegram User
        setUser(newUser);
        setCurrentView('shop');
    } else if (user) {
        // This was adding ID to existing Google user
        setUser({ ...user, telegramId });
        setCurrentView('shop');
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
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
    if(currentView !== 'banned') setCurrentView('my-orders');
  }

  const handleAdminPanel = () => {
    if(currentView !== 'banned') setCurrentView('admin');
  }

  const resetApp = () => {
    setOrderConfig(null);
    setCurrentView('hero');
  };

  // 1. Show Cinematic Intro first
  if (showIntro) {
    return <IntroLoader onFinish={() => setShowIntro(false)} />;
  }

  // 2. Then show Auth Loader
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
      
      {currentView === 'telegram-verify' && (
        <TelegramVerifier
          user={user}
          language={language}
          onVerified={handleTelegramVerified}
          onBack={handleBackToHero}
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
