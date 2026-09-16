const conversationModel = require("../models/conversation.model.js");

exports.getConversations = async (req, res) => {
  try {
    const conversations = await conversationModel.getUserConversations(req.user.id);
    res.status(200).json(conversations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
};

exports.startConversation = async (req, res) => {
  try {
    const { otherUserId } = req.body;
    if (!otherUserId) {
      return res.status(400).json({ error: "otherUserId is required" });
    }
    const conversation = await conversationModel.findOrCreateConversation(
      req.user.id,
      otherUserId
    );
    res.status(200).json(conversation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to start conversation" });
  }
};

exports.getMessageHistory = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = await conversationModel.getMessages(conversationId);
    res.status(200).json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};