import {useEffect,useState,useCallback} from "react";
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
                senderId:currentUserId,
                senderName:currentUserName,
                message:text,
            });
        },
        [socket,roomId,currentUser]
    );
    const loadHistory=useCallback(async()=>{
        const res=await fetch(`/api/rooms/${roomId}/chat`,{
            headers:{Authorization:`Bearer ${localStorage.getItem("token")}`},

        });
        const data=await res.json();
        setMessages(data.messages||[]);
    },[roomId]);
    return {messages,sendMessage,loadHistory};
};