import {saveMessage} from "../models/chatmessage.js";
export const registerChatHandler=(io,socket)=>{
    socket.on("chat:send",async ({roomId,senderId,senderName,message})=>{
        try{
            await saveMessage(roomId,senderId,message);
            io.to(roomId).emit("chat:receive",{
                senderId,
                senderName,
                message,
                created_at:new Date().toString(),
            });
        }catch(err){
            console.error("chat:send eror",err);
        }
    });
};