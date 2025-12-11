
import React, { useState } from 'react';
import { ArrowRightIcon, GlobeIcon, InfoIcon, CheckCircleIcon } from './Icons';
import { Language, User } from '../types';
import { translations } from '../utils/translations';

interface HeroProps {
  onStart: (method: 'google' | 'telegram') => void;
  onMyOrders: () => void;
  onAdmin?: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  user: User | null;
  onLogout: () => void;
}

const ADMIN_EMAIL = 'qoriyevagavharoy@gmail.com';

const Hero: React.FC<HeroProps> = ({ onStart, onMyOrders, onAdmin, language, setLanguage, user, onLogout }) => {
  const t = translations[language];
  const isAdmin = user?.email === ADMIN_EMAIL;
  const [showLangs, setShowLangs] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [searchLang, setSearchLang] = useState('');

  // Comprehensive list of languages
  const allLanguages: { code: Language; label: string; flag: string }[] = [
    // Core & Central Asia
    { code: 'uz', label: "O'zbek", flag: "🇺🇿" },
    { code: 'ru', label: "Русский", flag: "🇷🇺" },
    { code: 'en', label: "English", flag: "🇺🇸" },
    { code: 'kk', label: "Қазақша", flag: "🇰🇿" },
    { code: 'ky', label: "Кыргызча", flag: "🇰🇬" },
    { code: 'tg', label: "Тоҷикӣ", flag: "🇹🇯" },
    { code: 'az', label: "Azərbaycan", flag: "🇦🇿" },
    
    // Europe
    { code: 'tr', label: "Türkçe", flag: "🇹🇷" },
    { code: 'de', label: "Deutsch", flag: "🇩🇪" },
    { code: 'fr', label: "Français", flag: "🇫🇷" },
    { code: 'es', label: "Español", flag: "🇪🇸" },
    { code: 'it', label: "Italiano", flag: "🇮🇹" },
    { code: 'pt', label: "Português", flag: "🇵🇹" },
    { code: 'nl', label: "Nederlands", flag: "🇳🇱" },
    { code: 'pl', label: "Polski", flag: "🇵🇱" },
    { code: 'uk', label: "Українська", flag: "🇺🇦" },
    
    // Asia
    { code: 'zh', label: "中文 (Chinese)", flag: "🇨🇳" },
    { code: 'ja', label: "日本語 (Japanese)", flag: "🇯🇵" },
    { code: 'ko', label: "한국어 (Korean)", flag: "🇰🇷" },
    { code: 'hi', label: "हिन्दी (Hindi)", flag: "🇮🇳" },
    { code: 'ar', label: "العربية", flag: "🇸🇦" },
    { code: 'fa', label: "فارسی", flag: "🇮🇷" },
  ];

  const filteredLanguages = allLanguages.filter(l => 
    l.label.toLowerCase().includes(searchLang.toLowerCase()) || 
    l.code.includes(searchLang.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      
      {/* Background Video/Effect Placeholder */}
      <div className="absolute inset-0 z-0 bg-black">
        <div className="absolute inset-0 bg-gradient-to-b from-cyber-primary/10 via-transparent to-black"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
      </div>

      {/* Header Bar */}
      <div className="absolute top-0 w-full p-4 flex flex-col md:flex-row justify-between items-center z-50 bg-gradient-to-b from-black/90 to-transparent gap-4">
        <div className="flex gap-2 items-center">
            <div className="w-8 h-8 bg-cyber-primary text-black font-black flex items-center justify-center text-xl">E</div>
            <div className="flex flex-col">
                <span className="text-[12px] font-display font-black tracking-[0.2em] text-white uppercase leading-none">ELBEK</span>
                <span className="text-[10px] font-mono tracking-widest text-cyber-primary uppercase leading-none">PRODUCTIONS</span>
            </div>
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-4">
          {user && (
             <div className="flex items-center gap-3">
                 {isAdmin && onAdmin && (
                   <button onClick={onAdmin} className="hidden md:flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-white border border-red-500/30 px-3 py-1.5 rounded bg-red-950/30 hover:bg-red-600 transition-all">
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span> ADMIN
                   </button>
                 )}
                 
                 <button onClick={onMyOrders} className="hidden md:flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white hover:text-cyber-primary border border-white/10 px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 transition-all">
                    ORDERS
                 </button>
                 
                 <div className="hidden md:flex items-center gap-2 border border-cyber-primary/30 bg-black/80 px-3 py-1.5 rounded cyber-border">
                   {user.photoURL ? (
                     <img src={user.photoURL} alt="User" className="w-5 h-5 rounded-full ring-1 ring-cyber-primary" />
                   ) : (
                     <div className="w-5 h-5 rounded-full bg-cyber-primary text-black flex items-center justify-center text-xs font-bold uppercase">{user.displayName?.[0]}</div>
                   )}
                   <span className="text-xs font-mono text-gray-300 max-w-[100px] truncate">{user.displayName}</span>
                   <button onClick={onLogout} className="text-[10px] text-red-400 hover:text-red-300 ml-2 uppercase font-bold">LOGOUT</button>
                 </div>
             </div>
          )}

          {/* New Advanced Language Selector */}
          <button 
            onClick={() => setShowLangs(true)} 
            className="flex items-center gap-2 border border-white/20 bg-black/60 backdrop-blur-md px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-white/10 hover:border-cyber-primary transition-all rounded-sm group"
          >
             <GlobeIcon className="w-4 h-4 text-gray-400 group-hover:text-cyber-primary transition-colors" />
             <span className="text-gray-300 group-hover:text-white">{allLanguages.find(l => l.code === language)?.label || language.toUpperCase()}</span>
          </button>
        </div>
      </div>

      {/* ABOUT MODAL */}
      {showAbout && (
        <div className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-3xl bg-cyber-dark border border-white/10 cyber-border flex flex-col max-h-[90vh] shadow-2xl relative">
             <button onClick={() => setShowAbout(false)} className="absolute top-4 right-4 text-white hover:text-red-500 z-50 text-2xl font-bold">&times;</button>
             
             <div className="p-8 border-b border-white/10">
                <h2 className="text-3xl font-display font-bold text-white uppercase tracking-tighter">
                  {t.aboutTitle}
                </h2>
                <div className="flex gap-2 mt-2">
                   <span className="px-2 py-0.5 bg-green-500/20 text-green-500 text-[10px] font-bold uppercase rounded border border-green-500/30">100% Free Service</span>
                   <span className="px-2 py-0.5 bg-cyber-primary/20 text-cyber-primary text-[10px] font-bold uppercase rounded border border-cyber-primary/30">Verified</span>
                </div>
             </div>

             <div className="overflow-y-auto p-8 custom-scrollbar space-y-8">
                
                {/* 1. Owner */}
                <section>
                   <h3 className="text-xl text-cyber-primary font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                     <span className="w-8 h-8 rounded-full bg-cyber-primary text-black flex items-center justify-center">E</span>
                     {t.aboutOwnerTitle}
                   </h3>
                   <div className="bg-white/5 border border-white/10 p-5 rounded-lg text-gray-300 text-sm leading-relaxed">
                     {t.aboutOwnerText}
                   </div>
                </section>

                {/* 2. Process */}
                <section>
                   <h3 className="text-xl text-white font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                     <InfoIcon className="w-6 h-6 text-cyber-accent" />
                     {t.aboutProcessTitle}
                   </h3>
                   <div className="space-y-3">
                      {t.aboutProcessSteps.map((step, idx) => (
                        <div key={idx} className="flex gap-3 items-start bg-black/40 p-3 rounded border border-white/5 hover:border-cyber-accent/30 transition-colors">
                           <CheckCircleIcon className="w-5 h-5 text-cyber-accent shrink-0 mt-0.5" />
                           <p className="text-sm text-gray-400">{step}</p>
                        </div>
                      ))}
                   </div>
                </section>

                {/* 3. Status */}
                <section>
                   <h3 className="text-xl text-white font-bold uppercase tracking-wider mb-3">
                     {t.aboutStatusTitle}
                   </h3>
                   <div className="bg-gradient-to-r from-cyber-primary/10 to-transparent p-5 rounded border-l-4 border-cyber-primary text-sm text-gray-300">
                     {t.aboutStatusText}
                   </div>
                </section>

                 {/* 4. Trust */}
                 <section>
                   <h3 className="text-xl text-green-500 font-bold uppercase tracking-wider mb-3">
                     {t.aboutTrustTitle}
                   </h3>
                   <div className="border border-green-500/30 bg-green-500/5 p-5 rounded text-sm text-green-400 font-bold">
                     {t.aboutTrustText}
                   </div>
                </section>

             </div>

             <div className="p-6 border-t border-white/10 bg-black/20">
               <button onClick={() => setShowAbout(false)} className="w-full py-4 bg-white text-black font-bold uppercase tracking-widest hover:bg-cyber-primary hover:text-white transition-all">
                 OK, I Understand
               </button>
             </div>
          </div>
        </div>
      )}

      {/* Language Modal (Mega Menu) */}
      {showLangs && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 animate-fade-in">
           <div className="w-full max-w-6xl h-[85vh] flex flex-col">
              <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                 <div>
                    <h2 className="text-2xl md:text-3xl font-display font-bold text-white uppercase tracking-tighter">Select Region & Language</h2>
                    <p className="text-gray-500 text-xs font-mono mt-1">GLOBAL COVERAGE SYSTEM</p>
                 </div>
                 <button onClick={() => setShowLangs(false)} className="text-4xl text-gray-500 hover:text-white transition-colors">&times;</button>
              </div>
              
              <div className="mb-6 relative">
                 <input 
                   type="text" 
                   placeholder="SEARCH LANGUAGE OR COUNTRY..." 
                   value={searchLang}
                   onChange={(e) => setSearchLang(e.target.value)}
                   className="w-full bg-white/5 border border-white/10 p-4 text-white font-mono text-lg focus:border-cyber-primary focus:bg-black transition-all outline-none"
                   autoFocus
                 />
                 <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-mono">
                    {filteredLanguages.length} LANGUAGES
                 </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-10">
                 <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                    {filteredLanguages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => { setLanguage(lang.code); setShowLangs(false); setSearchLang(''); }}
                          className={`flex flex-col items-center justify-center gap-2 p-4 border transition-all duration-200 group relative overflow-hidden h-28 ${language === lang.code ? 'border-cyber-primary bg-cyber-primary/20' : 'border-white/5 bg-white/[0.02] hover:border-white/20 hover:bg-white/10'}`}
                        >
                          <span className="text-4xl filter group-hover:scale-110 transition-transform">{lang.flag}</span>
                          <span className={`text-xs font-bold uppercase text-center ${language === lang.code ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>{lang.label}</span>
                          <span className="text-[9px] text-gray-600 font-mono">{lang.code.toUpperCase()}</span>
                          
                          {language === lang.code && <div className="absolute top-0 right-0 w-3 h-3 bg-cyber-primary shadow-[0_0_10px_rgba(99,102,241,0.8)]"></div>}
                        </button>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Main Hero Content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 pt-20 pb-10 max-w-7xl mx-auto w-full relative z-10">
        
        {/* Animated Rings Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/5 rounded-full animate-spin-slow pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-white/5 rounded-full animate-spin-reverse pointer-events-none"></div>

        {/* Badge */}
        <div className="mb-10 relative group animate-fade-in-up">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyber-primary via-purple-500 to-cyber-accent rounded-sm blur opacity-30 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative px-8 py-3 bg-black border border-cyber-primary/50 text-cyber-primary text-sm font-bold tracking-[0.3em] uppercase cyber-border shadow-2xl">
            {t.freeBadge}
          </div>
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-8xl lg:text-9xl font-display font-black tracking-tighter leading-[0.9] mb-8 relative">
          <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 filter drop-shadow-2xl">{t.heroTitle.split(' ')[0]}</span>
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyber-primary via-white to-cyber-accent animate-pulse-fast">
             {t.heroTitle.split(' ').slice(1).join(' ')}
          </span>
        </h1>
        
        <p className="text-lg md:text-2xl text-gray-400 max-w-3xl mx-auto mb-16 font-light leading-relaxed border-l-2 border-cyber-primary/30 pl-6 text-left md:text-center md:border-0 md:pl-0">
          {t.heroSubtitle}
        </p>

        {/* Main Button / Login Button */}
        <div className="flex flex-col gap-6 items-center w-full max-w-lg mx-auto relative z-20">
              
              {!user ? (
                  <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        onClick={() => onStart('google')}
                        className="group relative flex items-center justify-center px-6 py-6 bg-white text-black font-display font-bold text-sm tracking-widest cyber-input hover:bg-gray-200 transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                      >
                         <span className="flex items-center gap-2">
                             GOOGLE LOGIN <ArrowRightIcon className="w-4 h-4" />
                         </span>
                      </button>

                      <button
                        onClick={() => onStart('telegram')}
                        className="group relative flex items-center justify-center px-6 py-6 bg-blue-500 text-white font-display font-bold text-sm tracking-widest cyber-input hover:bg-blue-400 transition-all duration-300 shadow-[0_0_30px_rgba(59,130,246,0.3)]"
                      >
                         <span className="flex items-center gap-2">
                             TELEGRAM LOGIN <ArrowRightIcon className="w-4 h-4" />
                         </span>
                      </button>
                  </div>
              ) : (
                  <button
                    onClick={() => onStart(user.authMethod)} // Method doesn't matter here if logged in
                    className="w-full group relative flex items-center justify-between px-6 py-6 bg-white text-black font-display font-black text-xl tracking-widest cyber-input hover:bg-cyber-primary hover:text-white transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)]"
                  >
                    <div className="flex flex-col items-start">
                       <span className="text-[9px] uppercase font-bold opacity-60 mb-1">{t.startBtn}</span>
                       <span>ENTER SHOP</span>
                    </div>
                    <div className="bg-black text-white p-2 rounded-full group-hover:bg-white group-hover:text-cyber-primary transition-colors">
                       <ArrowRightIcon className="w-5 h-5" />
                    </div>
                  </button>
              )}
              
              <div className="flex w-full gap-2">
                 <button
                    onClick={() => setShowAbout(true)}
                    className="flex-1 py-4 bg-cyber-dark text-white font-display font-bold text-sm tracking-widest cyber-input border border-white/10 hover:border-cyber-primary hover:text-cyber-primary transition-all duration-300"
                  >
                    <InfoIcon className="w-5 h-5 mx-auto" />
                  </button>
                  
                 {user && (
                    <button onClick={onMyOrders} className="md:hidden flex-1 py-4 bg-cyber-dark border border-white/10 cyber-input hover:border-cyber-primary text-gray-400 hover:text-white transition-colors">
                        <span className="text-xs font-bold uppercase tracking-widest">{t.myOrdersBtn}</span>
                    </button>
                 )}

                 {isAdmin && onAdmin && (
                    <button onClick={onAdmin} className="md:hidden flex-1 py-4 bg-red-900/20 border border-red-500/30 cyber-input hover:bg-red-500 text-red-500 hover:text-white transition-colors">
                        <span className="text-xs font-bold uppercase tracking-widest">ADMIN</span>
                    </button>
                 )}
              </div>
        </div>

        {/* Footer Info */}
        <div className="absolute bottom-6 w-full flex justify-between px-6 text-[9px] font-mono text-gray-600 uppercase tracking-widest">
           <div>System Status: <span className="text-green-500">OPTIMAL</span></div>
           <div>Security Level: <span className="text-cyber-primary">MAXIMUM</span></div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
