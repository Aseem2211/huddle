const express = require("express");
const userRouter = express.Router();
const {authMiddleware} = require("../middleware/auth.js");
const {updateProfileHandler}=require("../controller/usercontroller.js");
userRouter.put("/me",authMiddleware,updateProfileHandler);
module.exports = userRouter;