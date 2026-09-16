const express = require("express");
const userRouter = express.Router();
const {authMiddleware} = require("../middleware/auth.js");
const upload=require("../middleware/upload.js");
const {updateProfileHandler}=require("../controller/usercontroller.js");
userRouter.put("/me",authMiddleware,updateProfileHandler);
userRouter.post("/upload-avatar",authMiddleware,upload.single("avatar"),authcontroller.uploadAvatar);

userRouter.get("/search", authMiddleware, userController.searchUsers);
module.exports = userRouter;