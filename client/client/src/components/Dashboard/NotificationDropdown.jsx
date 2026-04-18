import React from 'react';
import { FiBell, FiCheck, FiTrash2, FiClock } from 'react-icons/fi';

const NotificationDropdown = ({ notifications, onMarkRead, onDelete, onClose }) => {
    return (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-5 duration-200">
            <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Notifications</h3>
                <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-0.5 rounded-full">
                    {notifications.filter(n => !n.read).length} New
                </span>
            </div>

            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                {notifications.length > 0 ? (
                    <div className="divide-y divide-gray-50">
                        {notifications.map((notif) => (
                            <div 
                                key={notif._id} 
                                className={`p-4 hover:bg-gray-50 transition-colors group cursor-default ${!notif.read ? 'bg-primary/[0.02]' : ''}`}
                            >
                                <div className="flex gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${!notif.read ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400'}`}>
                                        <FiBell size={18} />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <p className={`text-xs font-bold leading-tight ${!notif.read ? 'text-gray-900' : 'text-gray-500'}`}>
                                                {notif.title}
                                            </p>
                                            <span className="text-[9px] text-gray-400 font-medium">
                                                {new Date(notif.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 leading-relaxed font-medium">
                                            {notif.message}
                                        </p>
                                        <div className="flex items-center gap-4 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {!notif.read && (
                                                <button 
                                                    onClick={() => onMarkRead(notif._id)}
                                                    className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-1 hover:underline"
                                                >
                                                    <FiCheck /> Mark Read
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => onDelete(notif._id)}
                                                className="text-[9px] font-black text-red-400 uppercase tracking-widest flex items-center gap-1 hover:text-red-600 transition-colors"
                                            >
                                                <FiTrash2 /> Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-20 flex flex-col items-center justify-center text-center space-y-3 opacity-40">
                        <FiBell className="text-4xl text-gray-300" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">All caught up!</p>
                    </div>
                )}
            </div>

            <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
                <button 
                    onClick={onClose}
                    className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-primary transition-colors"
                >
                    Close Panel
                </button>
            </div>
        </div>
    );
};

export default NotificationDropdown;
