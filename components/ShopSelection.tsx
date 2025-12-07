import React, { useState, useEffect } from 'react';
import { DesignType, GameType, Language } from '../types';
import { ArrowRightIcon } from './Icons';
import { translations } from '../utils/translations';

interface ShopSelectionProps {
  onNext: (game: GameType, design: DesignType) => void;
  onBack: () => void;
  language: Language;
}

interface TextGameCardProps {
  isSelected: boolean;
  onClick: () => void;
  label: string;
}

const TextGameCard: React.FC<TextGameCardProps> = ({ 
  isSelected, 
  onClick, 
  label 
}) => {
  return (
    <div
      onClick={onClick}
      className={`relative group cursor-pointer h-24 md:h-32 flex flex-col items-center justify-center p-4 transition-all duration-200 cyber-border ${
        isSelected
          ? 'bg-cyber-primary text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]'
          : 'bg-cyber-dark border border-white/10 hover:border-cyber-primary/50 text-gray-400 hover:text-white'
      }`}
    >
      <span className={`font-display font-bold text-center uppercase tracking-wider ${isSelected ? 'scale-110' : ''}`}>
        {label}
      </span>
      
      {/* Tech decoration */}
      {!isSelected && (
        <>
          <div className="absolute top-0 left-0 w-1 h-1 bg-white/20"></div>
          <div className="absolute top-0 right-0 w-1 h-1 bg-white/20"></div>
          <div className="absolute bottom-0 left-0 w-1 h-1 bg-white/20"></div>
          <div className="absolute bottom-0 right-0 w-1 h-1 bg-white/20"></div>
        </>
      )}
    </div>
  );
};

const ShopSelection: React.FC<ShopSelectionProps> = ({ onNext, onBack, language }) => {
  const t = translations[language];
  const [selectedGame, setSelectedGame] = useState<GameType | null>(null);
  const [selectedDesign, setSelectedDesign] = useState<DesignType | null>(null);
  
  // Carousel State
  const [startIndex, setStartIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);

  useEffect(() => {
    const handleResize = () => {
      // Mobile: 2 items, Tablet/Desktop: 4 items
      if (window.innerWidth < 768) setItemsPerView(2);
      else setItemsPerView(4);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const games: GameType[] = [
    'pubg', 'csgo', 'minecraft', 'gta', 
    'valorant', 'freefire', 'roblox', 'standoff', 
    'cod', 'fifa', 'dota', 'vlog', 'other'
  ];

  const designs: DesignType[] = ['preview', 'banner', 'avatar', 'logo'];

  const canProceed = selectedGame && selectedDesign;

  const nextSlide = () => {
    if (startIndex + itemsPerView < games.length) {
      setStartIndex(prev => prev + 1);
    }
  };

  const prevSlide = () => {
    if (startIndex > 0) {
      setStartIndex(prev => prev - 1);
    }
  };

  const visibleGames = games.slice(startIndex, startIndex + itemsPerView);

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 flex flex-col max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <button onClick={onBack} className="text-gray-400 hover:text-white font-mono uppercase text-xs tracking-widest flex items-center gap-2">
          <span>&lt;</span> {t.back}
        </button>
        <div className="flex flex-col items-end">
          <div className="text-[10px] text-cyber-primary font-bold tracking-widest uppercase mb-1">
            Progress
          </div>
          <div className="flex gap-1">
             <div className={`h-1 w-8 ${selectedGame ? 'bg-cyber-primary' : 'bg-gray-800'}`}></div>
             <div className={`h-1 w-8 ${selectedDesign ? 'bg-cyber-primary' : 'bg-gray-800'}`}></div>
          </div>
        </div>
      </div>

      <div className="space-y-12">
        
        {/* Game Selection with Slider */}
        <section>
          <div className="flex justify-between items-end mb-6 border-b border-white/10 pb-2">
            <h3 className="text-xl md:text-2xl font-display font-bold text-white uppercase tracking-wider">
              <span className="text-cyber-primary mr-2">01.</span> {t.step1}
            </h3>
            
            <div className="flex gap-1">
              <button 
                onClick={prevSlide}
                disabled={startIndex === 0}
                className="w-10 h-10 border border-white/10 flex items-center justify-center hover:bg-white/10 disabled:opacity-30 disabled:border-transparent transition-all active:bg-cyber-primary active:text-white"
              >
                &larr;
              </button>
              <button 
                onClick={nextSlide}
                disabled={startIndex + itemsPerView >= games.length}
                className="w-10 h-10 border border-white/10 flex items-center justify-center hover:bg-white/10 disabled:opacity-30 disabled:border-transparent transition-all active:bg-cyber-primary active:text-white"
              >
                &rarr;
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 transition-all duration-300">
            {visibleGames.map((gameId) => (
              <TextGameCard
                key={gameId}
                isSelected={selectedGame === gameId}
                onClick={() => setSelectedGame(gameId)}
                label={t.games[gameId]}
              />
            ))}
          </div>
        </section>

        {/* Design Selection */}
        <section className={`transition-all duration-500 ${!selectedGame ? 'opacity-30 pointer-events-none grayscale' : ''}`}>
           <h3 className="text-xl md:text-2xl font-display font-bold text-white uppercase tracking-wider mb-6 border-b border-white/10 pb-2">
            <span className="text-cyber-primary mr-2">02.</span> {t.step2}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {designs.map((designId) => (
              <div
                key={designId}
                onClick={() => setSelectedGame && setSelectedDesign(designId)}
                className={`p-4 md:p-6 cursor-pointer relative flex flex-col justify-between h-32 md:h-40 cyber-border transition-all duration-200 ${
                  selectedDesign === designId
                    ? 'bg-cyber-accent text-black'
                    : 'bg-cyber-dark border border-white/10 hover:border-cyber-accent hover:text-white text-gray-400'
                }`}
              >
                <div className="text-2xl md:text-3xl">
                  {designId === 'preview' ? '🖼' : designId === 'banner' ? '🚩' : designId === 'avatar' ? '👤' : '🎨'}
                </div>
                <div>
                  <div className="font-bold text-sm md:text-lg uppercase tracking-wide leading-tight">{t.designs[designId]}</div>
                </div>
                
                {selectedDesign === designId && (
                  <div className="absolute top-2 right-2 w-2 h-2 bg-black animate-pulse"></div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Next Button */}
      <div className={`fixed bottom-0 left-0 w-full p-4 md:p-6 z-50 bg-gradient-to-t from-black via-black/90 to-transparent transition-transform duration-300 ${canProceed ? 'translate-y-0' : 'translate-y-full'}`}>
        <button
          onClick={() => selectedGame && selectedDesign && onNext(selectedGame, selectedDesign)}
          className="w-full max-w-md mx-auto py-4 bg-white text-black font-display font-black text-lg uppercase tracking-widest flex items-center justify-center gap-3 cyber-input hover:bg-cyber-primary hover:text-white transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)]"
        >
          {t.next}
          <ArrowRightIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ShopSelection;