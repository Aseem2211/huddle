// routes/conversationRoutes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.js"); 
const conversationController = require("../controllers/conversationcontroller.js");

router.get("/", authMiddleware, conversationController.getConversations);
router.post("/start", authMiddleware, conversationController.startOrGetConversation);
router.get("/:conversationId/messages", authMiddleware, conversationController.getConversationMessages);
router.post("/:conversationId/messages", authMiddleware, conversationController.sendMessage);

module.exports = router;