import axios from "axios";
const BASE_URL=import.meta.env.VITE_API_URL;
const axiosClient=axios.create({
    baseURL:BASE_URL,
    headers:{"content-Type":"application/json"},
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