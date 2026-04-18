import { create } from "zustand";
import api from "../utils/api";

export const useFreelancerJobs = create((set) => ({
    jobs: [],
    loading: false,
    error: null,

    fetchFreelancerJobs: async () => {
        set({ loading: true });
        try {
            set({ error: null });
            const response = await api.get("/jobs/freelancer-jobs");
            set({ jobs: response.data.data || [] });
        } catch (error) {
            set({ error: error });
            console.error("Failed to fetch freelancer jobs", error);
        } finally {
            set({ loading: false });
        }
    }
}));
