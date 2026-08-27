const pool=require("../config/db.js");
const Room={
    async create({room_id,host_id,title,status,scheduled_at}){
        const [result]=await pool.query(
            "INSERT INTO rooms (room_id,host_id,title,status,scheduled_at) VALUES (?,?,?,?,?)",
            [room_id,host_id,title,status,scheduled_at]
        );
        return {id:result.insertId,room_id,host_id,title,status,scheduled_at};
    },   
        
};
module.exports=Room;
