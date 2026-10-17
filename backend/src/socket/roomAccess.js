const pool=require("../config/db");
const pending=new Map();
const approved=new Map();
async function getRoom(roomId){
    const [rows]=await pool.query(
        "SELECT host_id,access_mode FROM rooms WHERE room_code=?",
        [roomId]
    );
    return rows[0] || null;
}
async function canJoin(roomId,userId){
    const room=await getRoom(roomId);
    if(!room){
        return false;
    }
    if(room.host_id==userId){
        return true;
    }if(room.access_mode==="open"){
        return true;
    }if(room.access_mode==="approval"){
        return approved.get(roomId)?.has(userId)===true;

    }return false;
}
function clearRoom(roomId){
    pending.delete(roomId);
    approved.delete(roomId);
}
function register(io,socket){
    socket.on("resquest-join",async({roomId},ack)=>{
        const room=await getRoom(roomId);
        if(!room){
            return ack({status:"not-found"});
           

        }
         const {id,name}=socket.user;
         if(room.host_id===id){
            socket.join(`host:${roomId}`);
            const list=pending.get(roomId);
            socket.emit("pending-resquets",list?[...list.values()]:[]);
            return ack({status:"allowed"});
         }
         if(await canJoin(roomId,id)){
            return ack({status:"allowed"});

         }if(room.access_mode==="locked"){
            return ack({status:"denied",reason:"locked"});
         }
         const list=pendingget(roomId)||new Map();
         list.set(id,{userId:id,name,socketId:socket.id});
         pending.set(roomId,list);
         io.to(`host:${roomId}`).emit("join-resquest",{userId:id,name,socketId:socket.id});
         ack({status:"watching"});
    });
    socket.on("respond-join", ({ roomId, userId, allow }) => {
    if (!socket.rooms.has(`host:${roomId}`)) return;
    const list = pending.get(roomId);
    const req = list?.get(userId);
    if (!req) return;
    list.delete(userId);
    if (allow) {
      if (!approved.has(roomId)) approved.set(roomId, new Set());
      approved.get(roomId).add(userId);
      io.to(req.socketId).emit("join-approved");
    } else {
      io.to(req.socketId).emit("join-denied", { reason: "rejected" });
    }
  });

  socket.on("disconnect", () => {
    for (const [roomId, list] of pending) {
      for (const [uid, r] of list) {
        if (r.socketId === socket.id) {
          list.delete(uid);
          io.to(`host:${roomId}`).emit("request-cancelled", { userId: uid });
        }
      }
    }
  });
}

module.exports = { register, canJoin, clearRoom };

