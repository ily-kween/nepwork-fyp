import { create } from "zustand";
import api from "../utils/api";

export const usePostedJobs = create((set) => ({
    jobs: [],
    error: null,
    loading: false,
    fetchPostedJobs: async () => {
        set({ loading: true });
        try {
            set({ error: null });
            const response = await api.get(
                "/jobs/get-jobs-posted-by-current-user",
            );
            set({ jobs: response.data.data });
        } catch (error) {
            set({ error: error });
            console.error(error);
        } finally {
            set({ loading: false });
        }
    },
}));
