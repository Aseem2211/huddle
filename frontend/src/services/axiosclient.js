import axios from "axios";

const raw = (import.meta.env.VITE_API_URL || "https://huddle-g0v2.onrender.com").replace(/\/$/, "");
const BASE_URL = raw.endsWith("/api") ? raw : `${raw}/api`;

const axiosClient = axios.create({
    baseURL: BASE_URL,
    headers: { "Content-Type": "application/json" },
    timeout:60000,
});
axiosClient.interceptors.request.use((config)=>{
    const token=localStorage.getItem("token");
    if(token){
        config.headers.Authorization=`Bearer ${token}`;
    }
    return config;
});
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const data = error.response?.data;
        const message = data?.error || data?.message ||
            (error.response ? `Request failed (${error.response.status})`
                            : "Cannot reach server. If it was idle, wait a minute and retry.");
        const err = new Error(message);
        err.status = error.response?.status;
        err.data = data;
        return Promise.reject(err);
    }
);

export default axiosClient;