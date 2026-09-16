const express = require("express");
const dmrouter = express.Router();
const dmcontroller = require("../controller/dmcontroller.js");
const authMiddleware = require("../middleware/auth.js");

dmrouter.get("/conversations", authMiddleware, dmcontroller.getConversations);
dmrouter.post("/conversations/start", authMiddleware, dmcontroller.startConversation);
dmrouter.get("/conversations/:conversationId/messages", authMiddleware, dmcontroller.getMessageHistory);

module.exports = dmrouter;