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
      year: 'numeric',
      month: 'long',
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
        <div className="space-y-8">
          {orders.map((order) => {
            const status = getStatusConfig(order.status);
            return (
              <div key={order.id} className={`bg-cyber-dark border border-white/10 p-5 pt-8 rounded-none relative group hover:border-opacity-50 transition-all cyber-border ${status.border} border-l-4 mt-8`}>
                 
                 {/* Prominent Status Badge */}
                 <div className={`absolute -top-5 right-4 pl-4 pr-5 py-2 rounded-t-lg md:rounded-full bg-black border ${status.border} flex items-center gap-3 shadow-[0_0_15px_rgba(0,0,0,0.5)] z-10`}>
                   {order.status !== 'completed' && (
                     <span className="relative flex h-3 w-3">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${status.bg}`}></span>
                        <span className={`relative inline-flex rounded-full h-3 w-3 ${status.bg}`}></span>
                     </span>
                   )}
                   {order.status === 'completed' && (
                     <span className="text-green-500 font-bold text-lg">✓</span>
                   )}
                   <span className={`text-sm md:text-base font-black uppercase tracking-widest ${status.color}`}>
                      {status.label}
                   </span>
                 </div>

                 <div className="flex flex-col md:flex-row md:items-center gap-6 mt-2">
                   {/* Icon */}
                   <div className={`w-16 h-16 bg-black/50 border border-white/10 flex items-center justify-center text-3xl shrink-0 ${status.color} shadow-[0_0_20px_rgba(0,0,0,0.3)]`}>
                      {order.selectedDesign === 'preview' ? '🖼' : order.selectedDesign === 'banner' ? '🚩' : order.selectedDesign === 'avatar' ? '👤' : '🎨'}
                   </div>

                   {/* Main Info */}
                   <div className="flex-1 min-w-0">
                      <div className="flex flex-col md:flex-row md:items-baseline gap-2 mb-1">
                         <h3 className="text-2xl font-display font-bold text-white uppercase tracking-wide truncate">
                            {t.games[order.selectedGame]}
                         </h3>
                         <span className="text-sm font-bold text-gray-400 uppercase shrink-0 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                            {t.designs[order.selectedDesign]}
                         </span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-xs font-mono text-gray-500 mt-3 border-t border-white/5 pt-3">
                         <div className="flex gap-2 items-center">
                            <span className="opacity-50">ID RAQAMI:</span>
                            <span className="text-white font-bold bg-white/10 px-1 rounded">#{order.id.slice(-6).toUpperCase()}</span>
                         </div>
                         <div className="flex gap-2">
                            <span className="opacity-50">{t.date}:</span>
                            <span className="text-gray-300">{formatDate(order.createdAt)}</span>
                         </div>
                      </div>
                      
                      <div className="mt-4 p-4 bg-black/40 border border-white/5 rounded-lg text-sm text-gray-300 relative">
                         <span className="absolute -top-2 left-2 bg-cyber-dark px-2 text-[10px] text-cyber-primary font-bold uppercase tracking-widest border border-cyber-primary/20 rounded">Izoh</span>
                         "{order.comment}"
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