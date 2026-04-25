import { create } from "zustand";
import { io } from "socket.io-client";
import api from "../utils/api";

const resolveSocketUrl = () => {
    const apiUrl = import.meta.env.VITE_API_ENDPOINT || "http://localhost:8000/api/v1";
    return import.meta.env.VITE_SOCKET_URL || apiUrl.replace(/\/api\/v1\/?$/, "");
};

export const useAuth = create((set, get) => ({
    userData: null,
    isLogginIn: false,
    isLoggedIn: false,
    socket: null,

    login: () => {
        set({ isLoggedIn: true });
    },

    logout: () => {
        const socket = get().socket;
        if (socket) {
            socket.disconnect();
        }
        set({ isLoggedIn: false, socket: null });
    },

    setUserData: async () => {
        set({ isLogginIn: true });
        try {
            const res = await api.get("/user/current-user-info");
            set({ userData: res.data.data, isLogginIn: false });
            get().connectSocket();
        } catch (err) {
            set({ isLogginIn: false });
            console.error(
                "Something went wrong while setting user data at store, ",
                err,
            );
        }
    },
    clearUserData: () => {
        set({ userData: null });
    },

    connectSocket: () => {
        const { userData, socket } = get();
        if (!socket && userData?._id) {
            const socketUrl = resolveSocketUrl();
            const newSocket = io(socketUrl, {
                transports: ["websocket", "polling"],
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
                query: { userId: userData._id },
            });
            set({ socket: newSocket });
            newSocket.on("connect", () => console.log("Socket connected:"));
            newSocket.on("disconnect", () =>
                console.log("Socket disconnected"),
            );
        }
    },
    disconnectSocket: () => {
        const socket = get().socket;
        if (socket) {
            socket.disconnect();
            set({ socket: null });
            console.log("Socket disconnected");
        }
    },
}));
