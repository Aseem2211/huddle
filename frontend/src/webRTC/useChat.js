import {useEffect,useState,useCallback} from "react";
import axiosClient from "../services/axiosclient.js";
export const useChat=(socket,roomId,currentUser)=>{
    const[messages,setMessages]=useState([]);
    useEffect(()=>{
        if(!socket){
            return;
        }
        const handleReceive=(msg)=>{
            setMessages((prev)=>[...prev,msg]);

        };
        socket.on("chat:receive",handleReceive);
        return ()=>socket.off("chat:receive",handleReceive);
    },[socket]);
    const sendMessage=useCallback(
        (text)=>{
            if(!text.trim()){
                return;
            }
            socket.emit("chat:send",{
                roomId,
                senderId:currentUser?.id,
                senderName:currentUser?.username,
                message:text,
            });
        },
        [socket,roomId,currentUser]
    );
    const loadHistory = useCallback(async () => {
        try {
            const res = await axiosClient.get(`/rooms/${roomId}/chat`);
            setMessages(res.data?.messages || []);
        } catch { /* history isn't saved yet */ }
        }, [roomId]);
    return {messages,sendMessage,loadHistory};
    
};