import pool from "../config/db.js";
export const saveMessage=async(roomId,senderId,message)=>{
    const [result]=await pool.query(
        "INSERT INTO chat_messages (room_id,sender_id,message) VALUE (?,?,?)",
        [roomId,senderId,message]
    );
    return result.insertId;
};
export const getMessagesByRoom=async(roomId,limit=50)=>{
    const [rows]=await pool.query(
        `SELECT cm.id,cm.message,cm.created_at,cm.sender_id,u.name as sender_name FROM chat_messages cm JOIN users u ON cm.sender_id=u.id WHERE cm.room_id=? ORDER BY cm.created_at ASC LIMIT ?`,
        [roomId,limit]
    );
    return rows;
};