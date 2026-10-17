const Room = require("../models/room.js");
const pool = require("../config/db");
const generateRoomId = require("../utils/generateRoomId.js");
const { clearRoom } = require("../socket/roomAccess");

exports.getRoom = async (req, res) => {
  const [rows] = await pool.query(
    "SELECT room_code, host_id, access_mode FROM room WHERE room_code = ?",
    [req.params.code]
  );
  if (!rows.length) return res.status(404).json({ message: "Room not found" });
  const r = rows[0];
  res.json({
    roomId: r.room_code,
    accessMode: r.access_mode,
    isHost: r.host_id === req.user.id,
  });
};

exports.setAccess = async (req, res) => {
  const { accessMode } = req.body;
  if (!["open", "approval", "locked"].includes(accessMode)) {
    return res.status(400).json({ message: "Invalid access mode" });
  }
  const [rows] = await pool.query("SELECT host_id FROM room WHERE room_code = ?", [req.params.code]);
  if (!rows.length) return res.status(404).json({ message: "Room not found" });
  if (rows[0].host_id !== req.user.id) return res.status(403).json({ message: "Only the host can do this" });
  await pool.query("UPDATE room SET access_mode = ? WHERE room_code = ?", [accessMode, req.params.code]);
  res.json({ accessMode });
};

exports.deleteRoom = async (req, res) => {
  const code = req.params.code;
  const [rows] = await pool.query("SELECT host_id FROM room WHERE room_code = ?", [code]);
  if (!rows.length) return res.status(404).json({ message: "Room not found" });
  if (rows[0].host_id !== req.user.id) return res.status(403).json({ message: "Only the host can do this" });
  await pool.query("DELETE FROM room WHERE room_code = ?", [code]);
  const io = req.app.get("io");
  io.to(code).emit("room-deleted");
  io.in(code).socketsLeave(code);
  clearRoom(code);
  res.json({ deleted: true });
}; 
exports.createRoom = async (req, res) => {
  try {
    const hostId = req.user.id;
    const { title, scheduledAt } = req.body;

    const status = scheduledAt ? "scheduled" : "active";

    const MAX_RETRIES = 5;
    let room = null;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const roomId = generateRoomId();

      try {
        room = await Room.create({
          room_id: roomId,
          host_id: hostId,
          title: title || "Untitled Meeting",
          status,
          scheduled_at: scheduledAt || null,
        });
        break;
      } catch (err) {
        if (err.code === "ER_DUP_ENTRY") {
          continue;
        }
        throw err;
      }
    }

    if (!room) {
      return res.status(500).json({ error: "Failed to generate a unique room ID, try again" });
    }

    return res.status(201).json({
      roomId: room.room_id,
      status: room.status,
      joinLink: `${process.env.CLIENT_URL}/room/${room.room_id}`,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong creating the room" });
  }
};
exports.getRecentMeetings=async(req,res)=>{
  try{
    const userId=req.user.id;
    const rooms=await Room.findRecentByUser(userId);
    return res.json(rooms);
  }catch(err){
    console.error(err);
    return res.status(500).json({error:"Failed to fetch the recent meetings"});
  }
};
exports.joinRoomHandler=async(req,res)=>{
  try{
    const roomId=String(req.params.roomId||"").trim().toLowerCase();
    const room=await Room.findByCode(roomId);
    if(!room){
      return res.status(404).json({message:"Room not found"});
    }
    res.status(200).json({roomId:room.room_id,title:room.title});
  }catch(err){
    console.error("join room error occured",err);
    res.status(500).json({message:"can not connect"});
  }

};