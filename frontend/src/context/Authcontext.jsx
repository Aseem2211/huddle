import {createContext,useContext,useEffect,useState,useCallback} from "react";
import * as Authapi from "../services/authApi.js";
const Authcontext=createContext();
export function AuthProvider({children}){
    const [token,setToken]=useState(()=>localStorage.getItem("token"));
    const [user,setUser]=useState(null);
    const [loading,setLoading]=useState(true);
    useEffect(()=>{
        let cancelled=false;
        async function loadUser(){
            if(!token){
                setUser(null);
                setLoading(false);
                return;
            }
            try{
                const data=await Authapi.getme(token);
                if(!cancelled){
                    setUser(data);
                }
            } catch (error) {
                if(!cancelled){
                    localStorage.removeItem("token");
                    setToken(null);
                    setUser(null);
                }
            } finally {
                if(!cancelled){
                    setLoading(false);
                }
            }
        }
        loadUser();
        return()=>{
            cancelled=true;
        };
    },[token]);
    const login=useCallback(async({email,password})=>{
        const data=await Authapi.login({email,password});
        localStorage.setItem("token",data.token);
        setToken(data.token);
        setUser(data.user);
        return data;
    },[]);
    const signup=useCallback(async({name,email,password})=>{
        const data=await Authapi.signup({name,email,password});
       
        return data;

    },[]);
    const logout=useCallback(()=>{
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
    },[]);
    const value={user,token,isAuthenticated:!!token,loading,login,signup,logout,setUser};
    return <Authcontext.Provider value={value}>{children}</Authcontext.Provider>;
}
export function useAuth(){
    const ctx=useContext(Authcontext);
    if(!ctx){
        throw new Error("useAuth must be used inside an AuthProvider ");

    }
    return ctx;
}