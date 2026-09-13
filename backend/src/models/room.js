const pool=require("../config/db.js");
const Room={
    async create({room_id,host_id,title,status,scheduled_at}){
        const [result]=await pool.query(
            "INSERT INTO rooms (room_id,host_id,title,status,scheduled_at) VALUES (?,?,?,?,?)",
            [room_id,host_id,title,status,scheduled_at]
        );
        return {id:result.insertId,room_id,host_id,title,status,scheduled_at};
    },
    async findByCode(room_id){
        const [rows]=await pool.query("SELECT * FROM rooms WHERE room_id=?",[room_id]);
        return rows[0];
    },
    async findRecentByUser(userId,limit=5){
        const [rows]=await pool.query(
            `SELECT room_id,title,status,created_at
            FROM rooms
            WHERE host_id=?
            ORDER By created_at DESC
            LIMIT ?`,
            [userId,limit]
        );
        return rows;
    },   
        
};
module.exports=Room;
