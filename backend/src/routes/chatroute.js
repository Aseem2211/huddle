import express from "express";
const chatrouter=express.Router();
import {getChatHistory} from "../controller/chatcontroller.js";
import {authMiddleware} from "../middleware/auth.js";
chatrouter.get("/:roomId",authMiddleware,getChatHistory);
export default chatrouter;