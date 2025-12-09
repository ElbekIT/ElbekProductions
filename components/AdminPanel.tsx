import React, { useEffect, useState } from 'react';
import { Language, Order } from '../types';
import { translations } from '../utils/translations';
import { getAllOrders, updateOrderStatus } from '../services/firebase';
import { LoaderIcon } from './Icons';

interface AdminPanelProps {
  language: Language;
  onBack: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ language, onBack }) => {
  const t = translations[language];
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    const data = await getAllOrders();
    setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    setUpdatingId(orderId);
    await updateOrderStatus(orderId, newStatus);
    
    // Update local state to reflect change immediately without full reload
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    setUpdatingId(null);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 flex flex-col max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <button onClick={onBack} className="text-gray-400 hover:text-white font-mono uppercase text-xs tracking-widest flex items-center gap-2">
          <span>&lt;</span> {t.back}
        </button>
        <div className="flex items-center gap-4">
             <button onClick={fetchOrders} className="bg-cyber-dark border border-cyber-primary/30 p-2 rounded hover:text-white text-cyber-primary transition-colors">
                <span className={loading ? "animate-spin block" : ""}>↻</span>
             </button>
             <h2 className="text-xl font-display font-bold text-red-500 uppercase tracking-wider">
                ADMIN PANEL
             </h2>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <LoaderIcon className="w-10 h-10 text-red-500" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[800px] space-y-4">
             <div className="grid grid-cols-12 gap-2 text-[10px] uppercase text-gray-500 font-bold tracking-widest px-4">
                <div className="col-span-2">Date/ID</div>
                <div className="col-span-2">Client</div>
                <div className="col-span-2">Type</div>
                <div className="col-span-3">Details</div>
                <div className="col-span-3 text-right">Actions</div>
             </div>

             {orders.map((order) => (
                <div key={order.id} className="bg-cyber-dark border border-white/10 p-4 rounded grid grid-cols-12 gap-2 items-center hover:border-cyber-primary/30 transition-colors">
                   
                   <div className="col-span-2 flex flex-col">
                      <span className="text-xs text-white font-mono">{formatDate(order.createdAt)}</span>
                      <span className="text-[10px] text-gray-500 font-mono">#{order.id.slice(-4)}</span>
                   </div>

                   <div className="col-span-2 flex flex-col">
                      <span className="text-sm font-bold text-white truncate">{order.firstName}</span>
                      <span className="text-xs text-cyber-primary truncate">@{order.telegramUsername.replace('@','')}</span>
                   </div>

                   <div className="col-span-2 flex flex-col">
                      <span className="text-xs text-white uppercase">{t.games[order.selectedGame]}</span>
                      <span className="text-[10px] text-gray-400 uppercase">{t.designs[order.selectedDesign]}</span>
                   </div>

                   <div className="col-span-3 text-xs text-gray-400 italic truncate pr-2 relative group cursor-help">
                      "{order.comment}"
                      <div className="absolute left-0 bottom-full bg-black border border-white/20 p-2 rounded w-64 hidden group-hover:block z-50 text-white not-italic">
                         {order.comment}
                      </div>
                   </div>

                   <div className="col-span-3 flex flex-col items-end gap-2">
                       {/* Current Status Badge */}
                       <div className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                           order.status === 'completed' ? 'border-green-500 text-green-500 bg-green-500/10' :
                           order.status === 'reviewing' ? 'border-yellow-400 text-yellow-400 bg-yellow-400/10' :
                           order.status === 'busy' ? 'border-red-500 text-red-500 bg-red-500/10' :
                           'border-gray-500 text-gray-400'
                       }`}>
                          {order.status}
                       </div>

                       {/* Action Buttons */}
                       <div className="flex gap-1 justify-end">
                          <button 
                             onClick={() => handleStatusChange(order.id, 'reviewing')}
                             disabled={updatingId === order.id}
                             title="Ko'rilmoqda"
                             className="w-6 h-6 flex items-center justify-center bg-yellow-400/10 border border-yellow-400/50 text-yellow-400 hover:bg-yellow-400 hover:text-black transition-colors rounded"
                          >
                             👁
                          </button>
                          <button 
                             onClick={() => handleStatusChange(order.id, 'busy')}
                             disabled={updatingId === order.id}
                             title="Band (Keyinroq)"
                             className="w-6 h-6 flex items-center justify-center bg-red-500/10 border border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white transition-colors rounded"
                          >
                             ⏳
                          </button>
                          <button 
                             onClick={() => handleStatusChange(order.id, 'completed')}
                             disabled={updatingId === order.id}
                             title="Tayyor"
                             className="w-6 h-6 flex items-center justify-center bg-green-500/10 border border-green-500/50 text-green-500 hover:bg-green-500 hover:text-black transition-colors rounded"
                          >
                             ✓
                          </button>
                       </div>
                   </div>
                </div>
             ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;