const Room = require("../model/room.model.js");
const generateRoomId = require("../utils/generateRoomId.js");

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
