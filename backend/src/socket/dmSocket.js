const dmModel = require("../models/conversation.model.js");

module.exports = function registerDmHandlers(io, socket) {
  if (socket.user) socket.join(`user:${socket.user.id}`);

  socket.on("dm:join", () => {
    if (socket.user) socket.join(`user:${socket.user.id}`);
  });

  socket.on("dm:send", async ({ conversationId, content } = {}) => {
    try {
      if (!socket.user) {
        return socket.emit("dm:error", { message: "Not signed in" });
      }
      if (typeof content !== "string" || !content.trim()) return;

      const conversation = await dmModel.getConversationById(conversationId);
      if (!conversation) {
        return socket.emit("dm:error", { message: "Conversation not found" });
      }

      const me = Number(socket.user.id);
      const one = Number(conversation.user_one_id);
      const two = Number(conversation.user_two_id);
      if (me !== one && me !== two) {
        return socket.emit("dm:error", { message: "Not authorized" });
      }

      const saved = await dmModel.saveMessage(conversation.id, me, content.trim().slice(0, 2000));
      const message = {
        ...saved,
        sender_name: socket.user.name,
        created_at: new Date().toISOString(),
      };
      const otherUserId = me === one ? two : one;

      io.to(`user:${me}`).to(`user:${otherUserId}`).emit("dm:new", message);
      io.to(`user:${me}`).to(`user:${otherUserId}`).emit("dm:receive", message);
    } catch (err) {
      console.error("dm:send error:", err);
      socket.emit("dm:error", { message: "Failed to send message" });
    }
  });
};
