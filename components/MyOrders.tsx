import React, { useEffect, useState } from 'react';
import { Language, Order, User } from '../types';
import { translations } from '../utils/translations';
import { getUserOrders } from '../services/firebase';
import { LoaderIcon } from './Icons';

interface MyOrdersProps {
  user: User;
  language: Language;
  onBack: () => void;
}

const MyOrders: React.FC<MyOrdersProps> = ({ user, language, onBack }) => {
  const t = translations[language];
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 flex flex-col max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <button onClick={onBack} className="text-gray-400 hover:text-white font-mono uppercase text-xs tracking-widest flex items-center gap-2">
          <span>&lt;</span> {t.back}
        </button>
        
        <div className="flex items-center gap-4">
             <button 
                onClick={fetchOrders}
                className="text-cyber-primary hover:text-white text-xs uppercase tracking-widest border border-cyber-primary/30 px-3 py-1 rounded hover:bg-cyber-primary/20 transition-colors flex items-center gap-2 active:scale-95"
             >
                <span className={loading ? "animate-spin" : ""}>↻</span> {language === 'uz' ? 'Yangilash' : 'Refresh'}
             </button>
             <h2 className="text-xl md:text-2xl font-display font-bold text-white uppercase tracking-wider hidden md:block">
                {t.myOrdersBtn}
             </h2>
        </div>
      </div>

      <h2 className="text-xl font-display font-bold text-white uppercase tracking-wider md:hidden mb-6">
           {t.myOrdersBtn}
      </h2>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh]">
          <LoaderIcon className="w-10 h-10 text-cyber-primary" />
          <p className="mt-4 text-xs font-mono text-gray-500 animate-pulse">DATABASE SYNC...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] border border-white/5 bg-white/[0.02] rounded-lg p-10">
          <div className="text-6xl mb-4 opacity-20">📂</div>
          <p className="text-gray-500 font-mono uppercase tracking-widest text-center">{t.noOrders}</p>
          <p className="text-xs text-gray-700 mt-2 text-center max-w-xs">
            Agar hozir buyurtma bergan bo'lsangiz, "Yangilash" tugmasini bosing.
          </p>
          <button 
             onClick={fetchOrders}
             className="mt-6 px-6 py-2 bg-cyber-dark border border-cyber-primary/30 text-cyber-primary hover:bg-cyber-primary hover:text-white transition-all text-xs uppercase tracking-widest"
          >
             Yangilash
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const status = getStatusConfig(order.status);
            return (
              <div key={order.id} className={`bg-cyber-dark border border-white/10 p-5 rounded-lg relative group hover:border-opacity-50 transition-all cyber-border ${status.border} border-l-4`}>
                 
                 <div className="flex gap-5">
                   {/* Icon */}
                   <div className={`w-14 h-14 bg-black/50 border border-white/10 flex items-center justify-center text-2xl shrink-0 ${status.color} shadow-[0_0_20px_rgba(0,0,0,0.3)] rounded`}>
                      {order.selectedDesign === 'preview' ? '🖼' : order.selectedDesign === 'banner' ? '🚩' : order.selectedDesign === 'avatar' ? '👤' : '🎨'}
                   </div>

                   {/* Main Content */}
                   <div className="flex-1 min-w-0 flex flex-col">
                      <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 mb-2">
                         <h3 className="text-lg font-display font-bold text-white uppercase tracking-wide truncate">
                            {t.games[order.selectedGame]}
                         </h3>
                         <span className="text-[10px] font-bold text-gray-400 uppercase shrink-0 bg-white/5 px-2 py-0.5 rounded border border-white/10 w-fit">
                            {t.designs[order.selectedDesign]}
                         </span>
                      </div>
                      
                      <div className="text-sm text-gray-300 italic mb-4 bg-black/20 p-2 rounded border border-white/5">
                         "{order.comment}"
                      </div>

                      {/* Footer: Date & Status */}
                      <div className="mt-auto pt-3 border-t border-white/5 flex flex-wrap items-center gap-3 text-[10px] sm:text-xs font-mono">
                         <span className="text-gray-600">#{order.id.slice(-4).toUpperCase()}</span>
                         <span className="text-gray-500">|</span>
                         <span className="text-gray-400">{formatDate(order.createdAt)}</span>
                         
                         {/* Status Badge moved here next to date */}
                         <div className={`ml-auto flex items-center gap-2 px-3 py-1 rounded-full border ${status.bgLight} ${status.border} ${status.color}`}>
                             {order.status !== 'completed' && (
                               <span className="relative flex h-2 w-2">
                                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${status.bg}`}></span>
                                  <span className={`relative inline-flex rounded-full h-2 w-2 ${status.bg}`}></span>
                               </span>
                             )}
                             {order.status === 'completed' && (
                               <span className="font-bold">✓</span>
                             )}
                             <span className="font-bold uppercase tracking-widest">
                                {status.label}
                             </span>
                         </div>
                      </div>
                   </div>
                 </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyOrders;