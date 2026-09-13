const express = require("express");
const roomRouter = express.Router();
const roomController = require("../controller/roomcontroller.js");
const authMiddleware = require("../middleware/auth.js");

roomRouter.post("/create", authMiddleware, roomController.createRoom);
roomRouter.get("/recent",authMiddleware,roomController.getRecentMeetings);
roomRouter.get("/:roomId",authMiddleware,roomController.joinRoomHandler);
module.exports = roomRouter;