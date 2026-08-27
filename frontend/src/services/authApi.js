import axiosClient from "./axiosclient.js";
export  async function signup({name,email,password}){
    const res=await axiosClient.post("/auth/signup",{name,email,password});
    return res.data;
}
export async function login({email,password}){
    const rse=await axiosClient.post("/auth/login",{email,password});
    return rse.data;
}
export async function getme(token){
    const res=await axiosClient.get("/auth/me",{
        headers:token?{
            Authorization:`Bearer ${token}`
        }:{},
    });
    return res.data;
}