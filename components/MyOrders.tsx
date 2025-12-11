
import React, { useEffect, useState } from 'react';
import { Language, Order, User } from '../types';
import { translations } from '../utils/translations';
import { getUserOrders } from '../services/firebase';
import { LoaderIcon, CheckCircleIcon } from './Icons';

interface MyOrdersProps {
  user: User;
  language: Language;
  onBack: () => void;
}

const MyOrders: React.FC<MyOrdersProps> = ({ user, language, onBack }) => {
  const t = translations[language];
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'result' | 'history'>('result');

  const fetchOrders = async () => {
    setLoading(true);
    // Add small artificial delay to show loader
    await new Promise(r => setTimeout(r, 500));
    const data = await getUserOrders(user.uid);
    setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [user.uid]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(language === 'uz' ? 'uz-UZ' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusConfig = (status: Order['status']) => {
    switch (status) {
      case 'busy':
        return {
          color: 'text-red-500',
          bg: 'bg-red-500',
          border: 'border-red-500',
          bgLight: 'bg-red-500/10',
          label: t.statusBusy
        };
      case 'reviewing':
        return {
          color: 'text-yellow-400',
          bg: 'bg-yellow-400',
          border: 'border-yellow-400',
          bgLight: 'bg-yellow-400/10',
          label: t.statusReviewing
        };
      case 'completed':
        return {
          color: 'text-green-500',
          bg: 'bg-green-500',
          border: 'border-green-500',
          bgLight: 'bg-green-500/10',
          label: t.statusCompleted
        };
      default: // sent or processing
        return {
          color: 'text-cyber-accent',
          bg: 'bg-cyber-accent',
          border: 'border-cyber-accent',
          bgLight: 'bg-cyber-accent/10',
          label: t.statusSent
        };
    }
  };

  // Find the latest completed order with an image
  const latestResult = orders.find(o => o.status === 'completed' && o.resultImage);

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 flex flex-col max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <button onClick={onBack} className="text-gray-400 hover:text-white font-mono uppercase text-xs tracking-widest flex items-center gap-2">
          <span>&lt;</span> {t.back}
        </button>
        
        <button 
           onClick={fetchOrders}
           className="text-cyber-primary hover:text-white text-xs uppercase tracking-widest border border-cyber-primary/30 px-3 py-1 rounded hover:bg-cyber-primary/20 transition-colors flex items-center gap-2 active:scale-95"
        >
           <span className={loading ? "animate-spin" : ""}>↻</span> {language === 'uz' ? 'Yangilash' : 'Refresh'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex mb-8 bg-black/40 border border-white/10 rounded-lg p-1 cyber-border">
          <button 
             onClick={() => setActiveTab('result')}
             className={`flex-1 py-3 text-xs md:text-sm font-bold uppercase tracking-widest rounded-md transition-all ${activeTab === 'result' ? 'bg-cyber-primary text-white shadow-lg' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
          >
             {t.tabMyResult}
          </button>
          <button 
             onClick={() => setActiveTab('history')}
             className={`flex-1 py-3 text-xs md:text-sm font-bold uppercase tracking-widest rounded-md transition-all ${activeTab === 'history' ? 'bg-cyber-primary text-white shadow-lg' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
          >
             {t.tabHistory}
          </button>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh]">
          <LoaderIcon className="w-10 h-10 text-cyber-primary" />
          <p className="mt-4 text-xs font-mono text-gray-500 animate-pulse">DATABASE SYNC...</p>
        </div>
      ) : (
        <>
          {/* TAB: RESULT */}
          {activeTab === 'result' && (
             <div className="flex flex-col items-center">
                {latestResult ? (
                   <div className="w-full max-w-2xl animate-fade-in-up">
                      <div className="bg-gradient-to-b from-green-500/10 to-transparent p-1 rounded-2xl cyber-border border border-green-500/30">
                         <div className="bg-black/80 backdrop-blur rounded-xl p-6 relative overflow-hidden">
                            <div className="flex items-center gap-3 mb-6">
                               <CheckCircleIcon className="w-6 h-6 text-green-500" />
                               <h2 className="text-xl md:text-2xl font-display font-black text-white uppercase tracking-wider">{t.resultTitle}</h2>
                            </div>

                            {/* Image Container */}
                            <div className="relative group mb-6 rounded-lg overflow-hidden border border-white/10">
                               <img 
                                 src={latestResult.resultImage} 
                                 alt="Final Result" 
                                 className="w-full h-auto object-cover max-h-[500px]" 
                               />
                               {/* Download Overlay */}
                               <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <a 
                                    href={latestResult.resultImage} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="px-6 py-3 bg-white text-black font-bold uppercase tracking-widest hover:bg-cyber-primary hover:text-white transition-colors"
                                  >
                                    {t.downloadBtn}
                                  </a>
                               </div>
                            </div>

                            {/* Description */}
                            <div className="bg-white/5 p-4 rounded border-l-2 border-cyber-primary">
                               <p className="text-[10px] text-cyber-primary uppercase font-bold mb-1">{t.resultDesc}</p>
                               <p className="text-gray-300 italic text-sm">"{latestResult.resultDescription}"</p>
                            </div>
                            
                            <div className="mt-4 text-[10px] text-gray-600 font-mono text-center uppercase">
                               ID: #{latestResult.id.slice(-6)} • {t.games[latestResult.selectedGame]} • {t.designs[latestResult.selectedDesign]}
                            </div>
                         </div>
                      </div>
                   </div>
                ) : (
                   <div className="flex flex-col items-center justify-center py-20 opacity-50">
                      <div className="w-20 h-20 border-2 border-dashed border-gray-600 rounded-xl flex items-center justify-center mb-4">
                         <span className="text-4xl">🖼</span>
                      </div>
                      <p className="text-gray-400 font-mono uppercase tracking-widest text-center max-w-xs">
                         {language === 'uz' ? 'Hozircha tayyor natija yo\'q. Iltimos kuting.' : 'No finished results yet. Please wait.'}
                      </p>
                   </div>
                )}
             </div>
          )}

          {/* TAB: HISTORY */}
          {activeTab === 'history' && (
             <div className="space-y-4 animate-fade-in">
                {orders.length === 0 ? (
                    <div className="p-10 text-center text-gray-500 font-mono border border-white/5 rounded-lg bg-white/[0.02]">
                       {t.noOrders}
                    </div>
                ) : (
                    orders.map((order) => {
                       const status = getStatusConfig(order.status);
                       return (
                         <div key={order.id} className={`bg-cyber-dark border border-white/10 p-4 rounded-lg relative hover:border-white/30 transition-all ${status.border} border-l-4`}>
                            <div className="flex justify-between items-start mb-2">
                               <div className="flex items-center gap-2">
                                  <span className="text-xl">{order.selectedDesign === 'preview' ? '🖼' : order.selectedDesign === 'banner' ? '🚩' : order.selectedDesign === 'avatar' ? '👤' : '🎨'}</span>
                                  <div>
                                     <h3 className="text-sm font-bold text-white uppercase">{t.games[order.selectedGame]}</h3>
                                     <div className="text-[10px] text-gray-500 uppercase">{t.designs[order.selectedDesign]}</div>
                                  </div>
                               </div>
                               <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${status.bgLight} ${status.color}`}>
                                  {status.label}
                               </div>
                            </div>
                            <div className="text-xs text-gray-400 font-mono flex justify-between mt-3 pt-2 border-t border-white/5">
                               <span>{formatDate(order.createdAt)}</span>
                               <span>#{order.id.slice(-4).toUpperCase()}</span>
                            </div>
                         </div>
                       );
                    })
                )}
             </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyOrders;
