import React, { useEffect, useState } from 'react';
import { Language, Order, User } from '../types';
import { translations } from '../utils/translations';
import { getUserOrders } from '../services/firebase';
import { LoaderIcon, ArrowRightIcon } from './Icons';

interface MyOrdersProps {
  user: User;
  language: Language;
  onBack: () => void;
}

const MyOrders: React.FC<MyOrdersProps> = ({ user, language, onBack }) => {
  const t = translations[language];
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const data = await getUserOrders(user.uid);
      setOrders(data);
      setLoading(false);
    };
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

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 flex flex-col max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <button onClick={onBack} className="text-gray-400 hover:text-white font-mono uppercase text-xs tracking-widest flex items-center gap-2">
          <span>&lt;</span> {t.back}
        </button>
        <h2 className="text-xl md:text-2xl font-display font-bold text-white uppercase tracking-wider">
           {t.myOrdersBtn}
        </h2>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh]">
          <LoaderIcon className="w-10 h-10 text-cyber-primary" />
          <p className="mt-4 text-xs font-mono text-gray-500 animate-pulse">LOADING DATA...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] border border-white/5 bg-white/[0.02] rounded-lg p-10">
          <div className="text-6xl mb-4 opacity-20">📂</div>
          <p className="text-gray-500 font-mono uppercase tracking-widest">{t.noOrders}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-cyber-dark border border-white/10 p-5 rounded-none relative group hover:border-cyber-primary/50 transition-all cyber-border">
               {/* Status Indicator */}
               <div className="absolute top-4 right-4 flex items-center gap-2">
                 <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-success opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyber-success"></span>
                 </span>
                 <span className="text-[10px] font-bold text-cyber-success uppercase tracking-wider">
                    {t.statusSent}
                 </span>
               </div>

               <div className="flex flex-col md:flex-row md:items-center gap-6">
                 {/* Icon */}
                 <div className="w-12 h-12 bg-cyber-primary/10 border border-cyber-primary/30 flex items-center justify-center text-2xl">
                    {order.selectedDesign === 'preview' ? '🖼' : order.selectedDesign === 'banner' ? '🚩' : order.selectedDesign === 'avatar' ? '👤' : '🎨'}
                 </div>

                 {/* Main Info */}
                 <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-baseline gap-2 mb-1">
                       <h3 className="text-lg font-bold text-white uppercase tracking-wide">
                          {t.games[order.selectedGame]}
                       </h3>
                       <span className="text-sm text-cyber-primary uppercase">
                          // {t.designs[order.selectedDesign]}
                       </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-xs font-mono text-gray-500 mt-2">
                       <div className="flex gap-2">
                          <span>ID:</span>
                          <span className="text-gray-300">{order.id.slice(-8).toUpperCase()}</span>
                       </div>
                       <div className="flex gap-2">
                          <span>{t.date}:</span>
                          <span className="text-gray-300">{formatDate(order.createdAt)}</span>
                       </div>
                       <div className="flex gap-2">
                          <span>Tel:</span>
                          <span className="text-gray-300">{order.phone}</span>
                       </div>
                       <div className="flex gap-2">
                          <span>TG:</span>
                          <span className="text-gray-300">{order.telegramUsername}</span>
                       </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-black/30 border-l-2 border-cyber-accent/50 text-sm text-gray-400 italic">
                       "{order.comment}"
                    </div>
                 </div>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;