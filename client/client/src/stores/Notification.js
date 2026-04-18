import { create } from "zustand";
import api from "../utils/api";
import toast from "react-hot-toast";

export const useNotification = create((set, get) => ({
    notifications: [],
    unreadCount: 0,
    loading: false,

    fetchNotifications: async (userId) => {
        set({ loading: true });
        try {
            const endpoint = userId ? `/notifications/user/${userId}` : '/notifications';
            const response = await api.get(endpoint);
            const notifications = response.data.data || [];
            const unreadCount = Array.isArray(notifications) ? notifications.filter(n => !n.isRead).length : 0;
            set({ notifications: Array.isArray(notifications) ? notifications : [], unreadCount, loading: false });
        } catch (error) {
            console.error("Failed to fetch notifications", error);
            set({ loading: false });
        }
    },

    addNotification: (notification) => {
        const { notifications, unreadCount } = get();
        set({
            notifications: [notification, ...notifications],
            unreadCount: unreadCount + 1
        });
        toast.success(notification.title, {
            description: notification.message,
            duration: 5000,
        });
    },

    markAsRead: async (notificationId) => {
        try {
            await api.patch(`/notifications/read/${notificationId}`);
            const { notifications, unreadCount } = get();
            const updatedNotifications = notifications.map(n =>
                n._id === notificationId ? { ...n, isRead: true } : n
            );
            set({
                notifications: updatedNotifications,
                unreadCount: Math.max(0, unreadCount - 1)
            });
        } catch (error) {
            console.error("Failed to mark notification as read", error);
        }
    },

    markAllAsRead: async () => {
        try {
            await api.patch('/notifications/read/all');
            const { notifications } = get();
            const updatedNotifications = notifications.map(n => ({ ...n, isRead: true }));
            set({ notifications: updatedNotifications, unreadCount: 0 });
        } catch (error) {
            console.error("Failed to mark all notifications as read", error);
        }
    },

    deleteNotification: async (notificationId) => {
        try {
            await api.delete(`/notifications/${notificationId}`);
            const { notifications, unreadCount } = get();
            const notification = notifications.find(n => n._id === notificationId);
            const newUnreadCount = notification && !notification.isRead ? Math.max(0, unreadCount - 1) : unreadCount;
            set({
                notifications: notifications.filter(n => n._id !== notificationId),
                unreadCount: newUnreadCount
            });
        } catch (error) {
            console.error("Failed to delete notification", error);
        }
    }
}));
