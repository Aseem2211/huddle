const registerDmHandlers=require("./dmSocket.js");
io.on("connection", (socket) => {
  console.log("new socket connection:", socket.id);

  socket.on("join-room", ({ roomId, userId }) => {
    socket.join(roomId);
    socket.roomId = roomId;
    socket.userId = userId;

    // sockets already in the room, before this one joined
    const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || [])
      .filter((id) => id !== socket.id);

    const existingUsers = clients.map((id) => {
      const s = io.sockets.sockets.get(id);
      return { socketId: id, userId: s?.userId };
    });

    socket.emit("existing-users", existingUsers); // tell the newcomer who's already there
    socket.to(roomId).emit("user-joined", { socketId: socket.id, userId }); // tell others someone joined
  });

  socket.on("offer", ({ to, offer }) => {
    io.to(to).emit("offer", { from: socket.id, offer });
  });

  socket.on("answer", ({ to, answer }) => {
    io.to(to).emit("answer", { from: socket.id, answer });
  });

  socket.on("ice-candidate", ({ to, candidate }) => {
    io.to(to).emit("ice-candidate", { from: socket.id, candidate });
  });

  socket.on("leave-room", () => {
    if (socket.roomId) {
      socket.to(socket.roomId).emit("user-left", { socketId: socket.id });
      socket.leave(socket.roomId);
    }
  });

  socket.on("disconnect", () => {
    if (socket.roomId) {
      socket.to(socket.roomId).emit("user-left", { socketId: socket.id });
    }
  });
   socket.on("dm:join", (userId) => {
    socket.join(`user_${userId}`);
  });
   socket.on("dm:send", async ({ conversationId, senderId, receiverId, content }) => {
    const conversationModel = require("../model/conversation.model.js");
    const message = await conversationModel.saveMessage(conversationId, senderId, content);
    io.to(`user_${receiverId}`).to(`user_${senderId}`).emit("dm:receive", {
      ...message,
      conversation_id: conversationId,
    });
  });
  registerDmHandlers(io,socket);
});