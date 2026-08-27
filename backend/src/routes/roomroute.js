const express = require("express");
const roomRouter = express.Router();
const roomController = require("../controller/room.controller.js");
const authMiddleware = require("../middleware/auth.js");

roomRouter.post("/create", authMiddleware, roomController.createRoom);

module.exports = roomRouter;