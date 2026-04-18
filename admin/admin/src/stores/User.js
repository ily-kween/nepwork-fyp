import { create } from "zustand";
import { api } from "../utils";
export const useUser = create((set) => ({
    data: null,
    setUserData: async () => {
        api.get("/user/current-user-info")
            .then((res) => {
                set({ data: res.data.data });
            })
            .catch((err) => {
                console.error(
                    "Something went wrong while setting user data at store,  ",
                    err,
                );
            });
    },
    clearUserData: () => {
        set({ data: null });
    },
}));
