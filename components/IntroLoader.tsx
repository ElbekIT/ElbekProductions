import React, { useEffect, useState } from 'react';

interface IntroLoaderProps {
  onFinish: () => void;
}

const IntroLoader: React.FC<IntroLoaderProps> = ({ onFinish }) => {
  const [percent, setPercent] = useState(0);
  const [text, setText] = useState('INITIALIZING CORE...');
  const [isExiting, setIsExiting] = useState(false);

  const sysTexts = [
    'CONNECTING TO SATELLITE...',
    'VERIFYING ENCRYPTION...',
    'LOADING ASSETS...',
    'ESTABLISHING SECURE LINK...',
    'SYSTEM OPTIMIZED.',
    'WELCOME USER.'
  ];

  useEffect(() => {
    // Progress Timer
    const timer = setInterval(() => {
      setPercent((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        // Random speed variation for realism
        const increment = Math.random() > 0.7 ? Math.floor(Math.random() * 5) + 1 : 1;
        return Math.min(prev + increment, 100);
      });
    }, 40);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Text Randomizer based on percent
    if (percent < 30) setText(sysTexts[0]);
    else if (percent < 50) setText(sysTexts[1]);
    else if (percent < 70) setText(sysTexts[2]);
    else if (percent < 90) setText(sysTexts[3]);
    else if (percent < 100) setText(sysTexts[4]);
    else setText(sysTexts[5]);

    // Finish Trigger
    if (percent === 100) {
      setTimeout(() => {
        setIsExiting(true);
        setTimeout(onFinish, 800); // Wait for exit animation
      }, 800);
    }
  }, [percent]);

  return (
    <div className={`fixed inset-0 z-[9999] bg-[#020205] flex flex-col items-center justify-center overflow-hidden transition-all duration-700 ${isExiting ? 'opacity-0 scale-105 filter blur-xl' : 'opacity-100'}`}>
      
      {/* Background Matrix/Grid Effect */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 animate-pulse"></div>
      
      {/* Central Content */}
      <div className="relative z-10 w-full max-w-2xl px-6 flex flex-col items-center">
        
        {/* Glitch Logo */}
        <div className="mb-12 relative">
          <h1 
            data-text="ELBEK PRODUCTIONS"
            className="text-4xl md:text-7xl font-display font-black tracking-tighter text-white glitch-text text-center leading-tight"
          >
            ELBEK PRODUCTIONS
          </h1>
          <div className="h-1 w-full bg-gradient-to-r from-transparent via-cyber-primary to-transparent mt-2"></div>
        </div>

        {/* Loading Bar */}
        <div className="w-full h-2 bg-gray-900 border border-white/10 rounded-full overflow-hidden relative mb-4 cyber-border">
          <div 
            className="h-full bg-cyber-primary shadow-[0_0_20px_#6366f1] transition-all duration-100 ease-out relative"
            style={{ width: `${percent}%` }}
          >
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-white animate-pulse"></div>
          </div>
        </div>

        {/* Info Row */}
        <div className="w-full flex justify-between items-end font-mono text-xs md:text-sm uppercase tracking-widest">
          <div className="text-cyber-primary animate-pulse">
            {text}
          </div>
          <div className="text-white font-bold text-2xl">
            {percent}<span className="text-sm text-gray-500">%</span>
          </div>
        </div>

        {/* Decorative Technical Elements */}
        <div className="absolute top-1/2 left-4 w-1 h-32 bg-gradient-to-b from-transparent via-white/20 to-transparent hidden md:block"></div>
        <div className="absolute top-1/2 right-4 w-1 h-32 bg-gradient-to-b from-transparent via-white/20 to-transparent hidden md:block"></div>

        <div className="mt-16 grid grid-cols-3 gap-8 opacity-50 text-[10px] font-mono text-gray-500 text-center w-full max-w-lg">
           <div>
              <span className="block text-cyber-accent">SERVER</span>
              ONLINE
           </div>
           <div>
              <span className="block text-cyber-accent">LOCATION</span>
              TRACKING
           </div>
           <div>
              <span className="block text-cyber-accent">SECURITY</span>
              ENCRYPTED
           </div>
        </div>
      </div>
    </div>
  );
};

export default IntroLoader;