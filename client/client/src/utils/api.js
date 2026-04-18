import axios from "axios";
import toast from "react-hot-toast";
import { logoutHelper } from "./logoutHelper";

const refreshAcessToken = async () => {
    try {
        const refreshToken = JSON.parse(localStorage.getItem("refreshToken"));
        const response = await axios.post(
            `${import.meta.env.VITE_API_ENDPOINT}/user/refresh-access-token`,
            { refreshToken: refreshToken },
        );

        const newAccessToken = response.data.data.newAccessToken;
        localStorage.setItem("accessToken", JSON.stringify(newAccessToken));
        return newAccessToken;
    } catch (error) {
        if (
            error.response.data.message ===
                "Refresh token expired! Login again" &&
            error.response.status == 401
        ) {
            toast.error("Session Expired! Please Login again");
            logoutHelper();
        }

        return Promise.reject(error);
    }
};

const api = axios.create({
    baseURL: import.meta.env.VITE_API_ENDPOINT,
});

// Sending Access token with every request in Authorization header
api.interceptors.request.use(
    function (config) {
        const accessToken = JSON.parse(localStorage.getItem("accessToken"));
        config.headers.Authorization = `Bearer ${accessToken}`;
        return config;
    },
    function (error) {
        return Promise.reject(error);
    },
);

// Refreshing access token and logging out if refresh token is also expired
api.interceptors.response.use(
    function (response) {
        return response;
    },
    async function (error) {
        // refreshing access token
        if (
            error.response &&
            error?.response.data.message === "Access Token Expired"
        ) {
            try {
                const newAccessToken = await refreshAcessToken();

                const originalRequest = error.config;
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                return api(originalRequest);
            } catch (error) {
                console.error("Access token refresh failed");
            }
        }
        return Promise.reject(error);
    },
);

export default api;
