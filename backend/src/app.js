const express =require("express");
const app=express();
app.use(express.json());
const roomRouter = require("./routes/room.routes.js");
const authrouter=require("./routes/authroute.js");
app.use("/api/auth",authrouter);
app.use("/api/rooms",roomrouter);
module.exports=app;
