import { create } from "zustand";

export const useAuth = create((set) => ({
    isLoggedIn: false,
    login: () => set((_) => ({ isLoggedIn: true })),
    logout: () => set((_) => ({ isLoggedIn: false })),
}));
