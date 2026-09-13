import axiosClient from "./axiosclient.js";
export async function updateProfileHandler({name,email,password}){
    const res=await axiosClient.put("/user/me",{name,email,password});
    return res.data;
}

export async function changePasswordHandler({oldPassword,newPassword}){
    const res=await axiosClient.put("/user/me/password",{oldPassword,newPassword});
    return res.data;
}