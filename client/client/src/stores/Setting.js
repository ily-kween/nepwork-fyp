import { create } from "zustand";

export const useSetting = create((set) => ({
    visible: false,
    open: () => set((_) => ({ visible: true })),
    close: () => set((_) => ({ visible: false })),
}));
