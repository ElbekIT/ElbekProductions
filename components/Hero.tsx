import React from 'react';
import { ArrowRightIcon, GlobeIcon } from './Icons';
import { Language, User } from '../types';
import { translations } from '../utils/translations';

interface HeroProps {
  onStart: () => void;
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

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      
      {/* Header Bar */}
      <div className="absolute top-0 w-full p-4 flex justify-between items-center z-50 bg-gradient-to-b from-black/80 to-transparent md:bg-none">
        <div className="flex gap-1 text-[10px] font-display tracking-widest text-cyber-accent uppercase">
          ELBEK PRODUCTIONS v2.0
        </div>
        
        <div className="flex items-center gap-4">
          {user && (
             <div className="flex items-center gap-4">
                 {isAdmin && onAdmin && (
                   <button onClick={onAdmin} className="hidden md:block text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-white transition-colors border border-red-500/30 px-3 py-1 rounded hover:bg-red-500">
                      {t.adminPanelBtn}
                   </button>
                 )}
                 
                 <button onClick={onMyOrders} className="hidden md:block text-[10px] font-bold uppercase tracking-widest text-cyber-primary hover:text-white transition-colors border border-cyber-primary/30 px-3 py-1 rounded hover:bg-cyber-primary/10">
                    {t.myOrdersBtn}
                 </button>
                 
                 <div className="hidden md:flex items-center gap-2 border border-white/10 bg-black/50 px-3 py-1 rounded-full">
                   {user.photoURL && (
                     <img src={user.photoURL} alt="User" className="w-6 h-6 rounded-full border border-cyber-primary" />
                   )}
                   <span className="text-xs font-mono text-gray-300">{user.displayName}</span>
                   <button onClick={onLogout} className="text-[10px] text-red-400 hover:text-red-300 ml-2 uppercase">EXIT</button>
                 </div>
             </div>
          )}

          <div className="flex border border-white/10 bg-black/50 backdrop-blur-md rounded-none">
            {(['uz', 'ru', 'en'] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all border-l border-white/5 first:border-0 ${
                  language === lang 
                    ? 'bg-cyber-primary text-white' 
                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 pt-20 pb-10 max-w-5xl mx-auto w-full">
        
        {/* Badge */}
        <div className="mb-8 relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyber-primary to-cyber-accent rounded-sm blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative px-6 py-2 bg-black border border-cyber-primary/50 text-cyber-primary text-sm font-bold tracking-[0.2em] uppercase cyber-border">
            {t.freeBadge}
          </div>
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-8xl lg:text-9xl font-display font-black tracking-tighter leading-none mb-6">
          <span className="block text-white mix-blend-difference">{t.heroTitle.split(' ')[0]}</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-primary via-white to-cyber-accent">
             {t.heroTitle.split(' ').slice(1).join(' ')}
          </span>
        </h1>
        
        <p className="text-lg md:text-2xl text-gray-400 max-w-2xl mx-auto mb-12 font-light border-l-2 border-cyber-primary/30 pl-6 text-left md:text-center md:border-0 md:pl-0">
          {t.heroSubtitle}
        </p>

        {/* Main Button / Login Button */}
        <div className="flex flex-col gap-3 items-center">
          <div className="flex gap-4">
              <button
                onClick={onStart}
                className="group relative inline-flex items-center gap-4 px-12 py-6 bg-white text-black font-display font-black text-xl tracking-wide cyber-input hover:bg-cyber-primary hover:text-white transition-all duration-300"
              >
                {user ? t.startBtn : (
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
                    </svg>
                    GOOGLE LOGIN
                  </span>
                )}
                <ArrowRightIcon className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-black transform translate-x-1/2 translate-y-1/2 rotate-45"></div>
              </button>
              
              {user && (
                 <button onClick={onMyOrders} className="md:hidden w-16 bg-cyber-dark border border-white/10 flex items-center justify-center cyber-input hover:border-cyber-primary transition-colors">
                    <span className="text-xl">📂</span>
                 </button>
              )}

              {isAdmin && onAdmin && (
                 <button onClick={onAdmin} className="md:hidden w-16 bg-red-900/20 border border-red-500/30 flex items-center justify-center cyber-input hover:bg-red-500 transition-colors">
                    <span className="text-xl">⚙️</span>
                 </button>
              )}
          </div>
          
          {!user && (
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">
              Hisobingizga kirish uchun bosing
            </p>
          )}
          {user && (
            <p className="text-[10px] text-cyber-primary uppercase tracking-widest">
              Xush kelibsiz, {user.displayName}
            </p>
          )}
        </div>

        {/* Stats Grid */}
        <div className="mt-20 w-full grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          {Object.entries(t.designs).map(([key, label], idx) => (
            <div key={key} className="relative group border border-white/5 bg-white/[0.02] p-4 flex flex-col items-center md:items-start transition-all hover:border-cyber-primary/50">
              <div className="text-2xl mb-2 text-cyber-accent opacity-80 group-hover:opacity-100">
                 {idx === 0 ? '01' : idx === 1 ? '02' : idx === 2 ? '03' : '04'}
              </div>
              <div className="font-bold text-gray-300 text-sm md:text-base uppercase tracking-wider">{label}</div>
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/20 group-hover:border-cyber-primary transition-colors"></div>
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/20 group-hover:border-cyber-primary transition-colors"></div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Decorative Footer */}
      <div className="w-full border-t border-white/5 py-4 px-6 flex justify-between text-[10px] text-gray-600 font-mono uppercase">
        <span>System: Online</span>
        <span>Secure Connection: Firebase Auth</span>
      </div>
    </div>
  );
};

export default Hero;