
import React, { useEffect, useState } from 'react';
import { Language, Order, FullUserData } from '../types';
import { translations } from '../utils/translations';
import { getAllOrders, updateOrderStatus, getAllUsersFromDb, banUser, unbanUser } from '../services/firebase';
import { LoaderIcon, AlertCircleIcon, CheckCircleIcon } from './Icons';

interface AdminPanelProps {
  language: Language;
  onBack: () => void;
}

type Tab = 'orders' | 'users' | 'banned';

const AdminPanel: React.FC<AdminPanelProps> = ({ language, onBack }) => {
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<Tab>('orders');
  
  // Data States
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<FullUserData[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Ban Input State
  const [banReason, setBanReason] = useState('');
  const [selectedUserForBan, setSelectedUserForBan] = useState<string | null>(null);

  const fetchAllData = async () => {
    setLoading(true);
    const [ordersData, usersData] = await Promise.all([
      getAllOrders(),
      getAllUsersFromDb()
    ]);
    setOrders(ordersData);
    setUsers(usersData);
    setLoading(false);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    setActionLoading(orderId);
    await updateOrderStatus(orderId, newStatus);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    setActionLoading(null);
  };

  const handleBanUser = async (userId: string) => {
    if (!banReason.trim()) return;
    setActionLoading(userId);
    const success = await banUser(userId, banReason);
    if (success) {
      setUsers(prev => prev.map(u => u.uid === userId ? { ...u, security: { isBanned: true, reason: banReason, attempts: 3, bannedAt: Date.now() } } : u));
      setSelectedUserForBan(null);
      setBanReason('');
    }
    setActionLoading(null);
  };

  const handleUnbanUser = async (userId: string) => {
    if(!window.confirm("Are you sure you want to unban this user?")) return;
    setActionLoading(userId);
    const success = await unbanUser(userId);
    if (success) {
      setUsers(prev => prev.map(u => u.uid === userId ? { ...u, security: { isBanned: false, attempts: 0 } } : u));
    }
    setActionLoading(null);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const bannedUsers = users.filter(u => u.security?.isBanned);
  const activeUsers = users.filter(u => !u.security?.isBanned);

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 flex flex-col max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
             <button onClick={onBack} className="text-gray-400 hover:text-white font-mono uppercase text-xs tracking-widest flex items-center gap-2">
               <span>&lt;</span> {t.back}
             </button>
             <h2 className="text-2xl font-display font-bold text-red-500 uppercase tracking-widest flex items-center gap-2">
                ADMIN <span className="text-white">COMMAND</span>
             </h2>
        </div>
        
        <div className="flex bg-cyber-dark border border-white/10 rounded overflow-hidden">
           {(['orders', 'users', 'banned'] as Tab[]).map((tab) => (
             <button
               key={tab}
               onClick={() => setActiveTab(tab)}
               className={`px-6 py-2 text-xs font-bold uppercase tracking-widest transition-all ${
                 activeTab === tab 
                   ? 'bg-red-600 text-white' 
                   : 'text-gray-400 hover:text-white hover:bg-white/5'
               }`}
             >
               {tab === 'orders' ? t.adminTabOrders : tab === 'users' ? t.adminTabUsers : t.adminTabBanned}
             </button>
           ))}
        </div>
        
        <button onClick={fetchAllData} className="bg-cyber-dark border border-cyber-primary/30 p-2 rounded hover:text-white text-cyber-primary transition-colors">
            <span className={loading ? "animate-spin block" : ""}>↻</span>
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <LoaderIcon className="w-16 h-16 text-red-500 animate-spin" />
          <p className="mt-4 text-xs font-mono text-gray-500 uppercase animate-pulse">Accessing Mainframe...</p>
        </div>
      ) : (
        <div className="bg-black/40 border border-white/10 rounded-lg overflow-hidden cyber-border min-h-[500px]">
          
          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="overflow-x-auto">
              <div className="min-w-[900px]">
                <div className="grid grid-cols-12 gap-2 text-[10px] uppercase text-gray-500 font-bold tracking-widest p-4 bg-white/5 border-b border-white/10">
                    <div className="col-span-2">Date / ID</div>
                    <div className="col-span-2">Client</div>
                    <div className="col-span-2">Type</div>
                    <div className="col-span-3">Comment</div>
                    <div className="col-span-3 text-right">Status & Action</div>
                </div>
                {orders.length === 0 ? (
                    <div className="p-10 text-center text-gray-500 font-mono">NO DATA</div>
                ) : (
                    orders.map((order) => (
                        <div key={order.id} className="grid grid-cols-12 gap-2 items-center p-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                           <div className="col-span-2">
                              <div className="text-white font-mono text-xs">{formatDate(order.createdAt)}</div>
                              <div className="text-gray-500 font-mono text-[10px]">#{order.id.slice(-4)}</div>
                           </div>
                           <div className="col-span-2">
                              <div className="text-white font-bold text-sm truncate">{order.firstName}</div>
                              <div className="text-cyber-primary text-xs">@{order.telegramUsername.replace('@','')}</div>
                           </div>
                           <div className="col-span-2">
                              <div className="text-xs uppercase text-gray-300">{t.games[order.selectedGame]}</div>
                              <div className="text-[10px] uppercase text-gray-500">{t.designs[order.selectedDesign]}</div>
                           </div>
                           <div className="col-span-3 text-xs text-gray-400 italic truncate relative group cursor-help">
                              "{order.comment}"
                              <div className="absolute left-0 bottom-full bg-black border border-white/20 p-2 rounded w-64 hidden group-hover:block z-50 text-white not-italic shadow-xl">
                                 {order.comment}
                              </div>
                           </div>
                           <div className="col-span-3 flex flex-col items-end gap-2">
                               <div className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                                   order.status === 'completed' ? 'border-green-500 text-green-500 bg-green-500/10' :
                                   order.status === 'reviewing' ? 'border-yellow-400 text-yellow-400 bg-yellow-400/10' :
                                   order.status === 'busy' ? 'border-red-500 text-red-500 bg-red-500/10' :
                                   'border-gray-500 text-gray-400'
                               }`}>
                                  {order.status}
                               </div>
                               <div className="flex gap-1">
                                  {(['reviewing', 'busy', 'completed'] as Order['status'][]).map(s => (
                                      <button 
                                         key={s}
                                         onClick={() => handleStatusChange(order.id, s)}
                                         disabled={actionLoading === order.id}
                                         className={`w-6 h-6 flex items-center justify-center rounded border transition-colors ${
                                             s === 'reviewing' ? 'border-yellow-400/30 text-yellow-400 hover:bg-yellow-400 hover:text-black' :
                                             s === 'busy' ? 'border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white' :
                                             'border-green-500/30 text-green-500 hover:bg-green-500 hover:text-black'
                                         }`}
                                      >
                                          {s === 'reviewing' ? '👁' : s === 'busy' ? '⏳' : '✓'}
                                      </button>
                                  ))}
                               </div>
                           </div>
                        </div>
                    ))
                )}
              </div>
            </div>
          )}

          {/* USERS TAB */}
          {activeTab === 'users' && (
             <div className="overflow-x-auto">
               <div className="min-w-[800px]">
                 <div className="grid grid-cols-12 gap-2 text-[10px] uppercase text-gray-500 font-bold tracking-widest p-4 bg-white/5 border-b border-white/10">
                     <div className="col-span-4">{t.adminColUser}</div>
                     <div className="col-span-4">{t.adminColLogin}</div>
                     <div className="col-span-4 text-right">{t.adminColAction}</div>
                 </div>
                 {activeUsers.length === 0 ? (
                    <div className="p-10 text-center text-gray-500 font-mono">NO ACTIVE USERS</div>
                 ) : (
                    activeUsers.map(u => (
                       <div key={u.uid} className="grid grid-cols-12 gap-2 items-center p-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                           <div className="col-span-4 flex items-center gap-3">
                              {u.profile.photoURL ? (
                                 <img src={u.profile.photoURL} className="w-8 h-8 rounded-full border border-white/20" alt=""/>
                              ) : (
                                 <div className="w-8 h-8 rounded-full bg-cyber-primary flex items-center justify-center text-black font-bold">{u.profile.displayName?.[0]}</div>
                              )}
                              <div>
                                 <div className="text-sm font-bold text-white">{u.profile.displayName}</div>
                                 <div className="text-xs text-gray-500">{u.profile.email}</div>
                              </div>
                           </div>
                           <div className="col-span-4 text-xs font-mono text-gray-400">
                               {u.profile.lastLogin ? formatDate(u.profile.lastLogin) : 'N/A'}
                           </div>
                           <div className="col-span-4 flex justify-end">
                               {selectedUserForBan === u.uid ? (
                                   <div className="flex items-center gap-2 bg-red-900/20 p-1 rounded border border-red-500/30 animate-fade-in">
                                       <input 
                                         type="text" 
                                         placeholder={t.adminBanPlaceholder}
                                         className="bg-transparent text-xs text-white outline-none px-2 w-32"
                                         value={banReason}
                                         onChange={(e) => setBanReason(e.target.value)}
                                         autoFocus
                                       />
                                       <button onClick={() => handleBanUser(u.uid)} className="text-red-500 hover:text-white px-2 font-bold">OK</button>
                                       <button onClick={() => setSelectedUserForBan(null)} className="text-gray-500 hover:text-white px-2">X</button>
                                   </div>
                               ) : (
                                   <button 
                                     onClick={() => setSelectedUserForBan(u.uid)}
                                     className="px-4 py-1 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white text-[10px] uppercase font-bold tracking-wider rounded transition-colors"
                                   >
                                     {t.adminBtnBan}
                                   </button>
                               )}
                           </div>
                       </div>
                    ))
                 )}
               </div>
             </div>
          )}

          {/* BANNED TAB */}
          {activeTab === 'banned' && (
             <div className="overflow-x-auto">
               <div className="min-w-[800px]">
                 <div className="grid grid-cols-12 gap-2 text-[10px] uppercase text-gray-500 font-bold tracking-widest p-4 bg-red-950/20 border-b border-red-900/30">
                     <div className="col-span-3">{t.adminColUser}</div>
                     <div className="col-span-3">Ban Date</div>
                     <div className="col-span-3">{t.adminColReason}</div>
                     <div className="col-span-3 text-right">{t.adminColAction}</div>
                 </div>
                 {bannedUsers.length === 0 ? (
                    <div className="p-10 text-center text-gray-500 font-mono">NO BANNED USERS</div>
                 ) : (
                    bannedUsers.map(u => (
                       <div key={u.uid} className="grid grid-cols-12 gap-2 items-center p-4 border-b border-white/5 bg-red-950/10 hover:bg-red-900/20 transition-colors">
                           <div className="col-span-3 flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-bold">!</div>
                              <div>
                                 <div className="text-sm font-bold text-gray-300 decoration-line-through">{u.profile.displayName}</div>
                                 <div className="text-xs text-red-400">{u.profile.email}</div>
                              </div>
                           </div>
                           <div className="col-span-3 text-xs font-mono text-gray-400">
                               {u.security?.bannedAt ? formatDate(u.security.bannedAt) : 'N/A'}
                           </div>
                           <div className="col-span-3 text-xs text-white font-bold uppercase tracking-wide">
                               {u.security?.reason || 'Unknown'}
                           </div>
                           <div className="col-span-3 flex justify-end">
                               <button 
                                 onClick={() => handleUnbanUser(u.uid)}
                                 disabled={actionLoading === u.uid}
                                 className="px-4 py-1 border border-green-500/30 text-green-500 hover:bg-green-500 hover:text-black text-[10px] uppercase font-bold tracking-wider rounded transition-colors flex items-center gap-2"
                               >
                                 <CheckCircleIcon className="w-3 h-3" />
                                 {t.adminBtnUnban}
                               </button>
                           </div>
                       </div>
                    ))
                 )}
               </div>
             </div>
          )}

        </div>
      )}
    </div>
  );
};

export default AdminPanel;
