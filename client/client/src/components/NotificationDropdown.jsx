import React from "react";
import { useNavigate } from "react-router";
import { formatDistanceToNow } from "date-fns";
import { useNotification } from "../stores";
import { FiBell, FiTrash2, FiCheck } from "react-icons/fi";
import { MdPayment, MdWork, MdNotifications } from "react-icons/md";

const NotificationDropdown = ({ onClose }) => {
    const { notifications, markAsRead, deleteNotification, markAllAsRead } = useNotification();
    const navigate = useNavigate();

    const getIcon = (type) => {
        switch (type) {
            case "payment_received":
                return <MdPayment className="text-green-500" />;
            case "job_accepted":
            case "job_applied":
            case "job_started":
            case "job_completed":
                return <MdWork className="text-blue-500" />;
            default:
                return <MdNotifications className="text-gray-500" />;
        }
    };

    const handleNotificationClick = (notification) => {
        if (!notification.isRead) {
            markAsRead(notification._id);
        }
        if (notification.link) {
            navigate(notification.link);
        }
        onClose();
    };

    return (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-secondary overflow-hidden z-[100] animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b border-secondary flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-lg text-primary flex items-center gap-2">
                    <FiBell /> Notifications
                </h3>
                <button 
                    onClick={markAllAsRead}
                    className="text-xs text-primary hover:underline font-medium"
                >
                    Mark all as read
                </button>
            </div>
            
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                    <div className="p-8 text-center text-secondaryText">
                        <MdNotifications className="text-5xl mx-auto mb-2 opacity-20" />
                        <p>No notifications yet</p>
                    </div>
                ) : (
                    notifications.map((notification) => (
                        <div 
                            key={notification._id}
                            className={`p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors relative group ${!notification.isRead ? "bg-primary/5" : ""}`}
                            onClick={() => handleNotificationClick(notification)}
                        >
                            <div className="flex gap-3">
                                <div className="mt-1 text-xl">
                                    {getIcon(notification.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className={`text-sm font-semibold truncate ${!notification.isRead ? "text-primary" : "text-gray-800"}`}>
                                        {notification.title}
                                    </h4>
                                    <p className="text-xs text-secondaryText mt-1 line-clamp-2">
                                        {notification.message}
                                    </p>
                                    <span className="text-[10px] text-gray-400 mt-2 block">
                                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="absolute right-2 top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {!notification.isRead && (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); markAsRead(notification._id); }}
                                        className="p-1 hover:bg-white rounded shadow-sm text-primary"
                                        title="Mark as read"
                                    >
                                        <FiCheck size={14} />
                                    </button>
                                )}
                                <button 
                                    onClick={(e) => { e.stopPropagation(); deleteNotification(notification._id); }}
                                    className="p-1 hover:bg-white rounded shadow-sm text-red-500"
                                    title="Delete"
                                >
                                    <FiTrash2 size={14} />
                                </button>
                            </div>
                            {!notification.isRead && (
                                <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary rounded-full"></div>
                            )}
                        </div>
                    ))
                )}
            </div>
            
            <div className="p-3 border-t border-secondary text-center bg-gray-50">
                <button 
                    onClick={() => { navigate("/notifications"); onClose(); }}
                    className="text-sm text-primary font-bold hover:text-primary/80 transition-colors"
                >
                    View all notifications
                </button>
            </div>
        </div>
    );
};

export default NotificationDropdown;
