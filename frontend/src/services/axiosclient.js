import axios from "axios";

const raw = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");
const BASE_URL = raw.endsWith("/api") ? raw : `${raw}/api`;

const axiosClient = axios.create({
    baseURL: BASE_URL,
    headers: { "Content-Type": "application/json" },
});
axiosClient.interceptors.request.use((config)=>{
    const token=localStorage.getItem("token");
    if(token){
        config.headers.Authorization=`Bearer ${token}`;
    }
    return config;
});
axiosClient.interceptors.response.use(
    (response)=>response,
    (error)=>{
        const message=
        error.response?.data?.error||error.message||"An error occured";
        return Promise.reject(new Error(message));
    }
);
export default axiosClient;