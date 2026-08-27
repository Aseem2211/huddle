const express=require("express");
const authrouter=express.Router();
const authcontroller=require("../controller/authcontroller.js");
const authMiddleware=require("../middleware/auth.js");
authrouter.post("/signup",authcontroller.signup);
authrouter.post("/login",authcontroller.login);
authrouter.get("/me",authMiddleware,authcontroller.getme);
module.exports=authrouter;