const express = require("express");
const userRouter = express.Router();
const authMiddleware = require("../middleware/auth.js");
const upload = require("../middleware/upload.js");
const userController = require("../controller/usercontroller.js");

userRouter.get("/search", authMiddleware, userController.searchUsers);
userRouter.put("/profile", authMiddleware, userController.updateProfileHandler);
userRouter.put("/change-password", authMiddleware, userController.changePasswordHandler);
userRouter.post("/upload-avatar", authMiddleware, upload.single("avatar"), userController.uploadAvatar);

module.exports = userRouter;
