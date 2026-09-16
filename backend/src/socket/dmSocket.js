// socket/dmSocket.js
const dmModel = require("../models/conversation.model.js");

module.exports = function registerDmHandlers(io, socket) {
  socket.join(`user:${socket.userId}`);

  socket.on("dm:send", async ({ conversationId, content }) => {
    try {
      if (!content || content.trim().length === 0) return;

      const conversation = await dmModel.getConversationById(conversationId);
      if (!conversation) {
        return socket.emit("dm:error", { message: "Conversation not found" });
      }

      // make sure the sender is actually part of this conversation
      const isParticipant =
        conversation.user_one_id === socket.userId ||
        conversation.user_two_id === socket.userId;
      if (!isParticipant) {
        return socket.emit("dm:error", { message: "Not authorized" });
      }

      const message = await dmModel.saveMessage(conversationId, socket.userId, content.trim());

      const otherUserId =
        conversation.user_one_id === socket.userId
          ? conversation.user_two_id
          : conversation.user_one_id;

      // send to both sender (other tabs/devices) and recipient
      io.to(`user:${socket.userId}`).emit("dm:new", message);
      io.to(`user:${otherUserId}`).emit("dm:new", message);
    } catch (err) {
      console.error("dm:send error:", err);
      socket.emit("dm:error", { message: "Failed to send message" });
    }
  });
};