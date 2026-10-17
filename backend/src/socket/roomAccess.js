const pool = require("../config/db");

const TABLE = "rooms";
const ID_COLUMN = "room_id";

const pending = new Map();
const approved = new Map();

const norm = (v) => String(v || "").trim().toLowerCase();
const sameUser = (a, b) => String(a) === String(b);

async function getRoom(roomId) {
  const [rows] = await pool.query(
    `SELECT host_id, access_mode FROM ${TABLE} WHERE ${ID_COLUMN} = ?`,
    [roomId]
  );
  return rows[0] || null;
}

async function canJoin(rawRoomId, userId) {
  const roomId = norm(rawRoomId);
  const room = await getRoom(roomId);
  if (!room) return false;
  if (sameUser(room.host_id, userId)) return true;
  if (room.access_mode === "open") return true;
  if (room.access_mode === "approval") {
    return approved.get(roomId)?.has(String(userId)) === true;
  }
  return false;
}

function clearRoom(rawRoomId) {
  const roomId = norm(rawRoomId);
  pending.delete(roomId);
  approved.delete(roomId);
}

function register(io, socket) {
  socket.on("request-join", async (data, ack) => {
    const reply = typeof ack === "function" ? ack : () => {};
    const roomId = norm(data?.roomId);
    const user = socket.user;
    if (!user) return reply({ status: "denied", reason: "no-user" });

    const room = await getRoom(roomId);
    if (!room) return reply({ status: "not-found" });

    if (sameUser(room.host_id, user.id)) {
      socket.join(`host:${roomId}`);
      const list = pending.get(roomId);
      socket.emit("pending-requests", list ? [...list.values()] : []);
      return reply({ status: "allowed" });
    }

    if (await canJoin(roomId, user.id)) return reply({ status: "allowed" });
    if (room.access_mode === "locked") return reply({ status: "denied", reason: "locked" });

    const list = pending.get(roomId) || new Map();
    list.set(String(user.id), { userId: user.id, name: user.name, socketId: socket.id });
    pending.set(roomId, list);
    io.to(`host:${roomId}`).emit("join-request", {
      userId: user.id,
      name: user.name,
      socketId: socket.id,
    });
    reply({ status: "waiting" });
  });

  socket.on("respond-join", (data) => {
    const roomId = norm(data?.roomId);
    if (!socket.rooms.has(`host:${roomId}`)) return;
    const list = pending.get(roomId);
    const key = String(data?.userId);
    const request = list?.get(key);
    if (!request) return;
    list.delete(key);
    if (data.allow) {
      if (!approved.has(roomId)) approved.set(roomId, new Set());
      approved.get(roomId).add(key);
      io.to(request.socketId).emit("join-approved");
    } else {
      io.to(request.socketId).emit("join-denied", { reason: "rejected" });
    }
  });

  socket.on("disconnect", () => {
    for (const [roomId, list] of pending) {
      for (const [key, request] of list) {
        if (request.socketId === socket.id) {
          list.delete(key);
          io.to(`host:${roomId}`).emit("request-cancelled", { userId: request.userId });
        }
      }
    }
  });
}

module.exports = { register, canJoin, clearRoom };