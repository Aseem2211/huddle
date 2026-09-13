import {getMessagesByRoom} from "../models/chatmessage.js";
export const getChatHistory=async(req,res)=>{
    try{
        const {roomId}=req.params;
        const messages=await getMessagesByRoom(roomId);
        res.status(200).json({messages});

    }catch(err){
        console.error("getChatHistory error:" ,err);
        res.status(500).json({error: "Internal Server Error"});
    }

};