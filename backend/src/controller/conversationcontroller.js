// controllers/conversationController.js
const dmModel = require("../models/conversation.model.js"); // adjust path to wherever you saved the CommonJS model

exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const conversations = await dmModel.getUserConversations(userId);
    res.json(conversations);
  } catch (err) {
    console.error("getConversations error:", err);
    res.status(500).json({ message: "Failed to load conversations" });
  }
};

exports.startOrGetConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { otherUserId } = req.body;

    if (!otherUserId) {
      return res.status(400).json({ message: "otherUserId is required" });
    }
    if (Number(otherUserId) === userId) {
      return res.status(400).json({ message: "Cannot message yourself" });
    }

    const conversation = await dmModel.findOrCreateConversation(userId, Number(otherUserId));
    res.json(conversation);
  } catch (err) {
    console.error("startOrGetConversation error:", err);
    res.status(500).json({ message: "Failed to start conversation" });
  }
};

exports.getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = await dmModel.getMessages(conversationId);
    res.json(messages);
  } catch (err) {
    console.error("getConversationMessages error:", err);
    res.status(500).json({ message: "Failed to load messages" });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const senderId = req.user.id;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    const message = await dmModel.saveMessage(conversationId, senderId, content.trim());
    res.status(201).json(message);
  } catch (err) {
    console.error("sendMessage error:", err);
    res.status(500).json({ message: "Failed to send message" });
  }
};