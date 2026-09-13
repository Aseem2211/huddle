const express =require("express");
const app=express();
const cors=require("cors");
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true,
}));
app.use(express.json());
const roomRouter = require("./routes/roomroute.js");
const authrouter=require("./routes/authroute.js");
app.use("/api/auth",authrouter);
app.use("/api/rooms",roomRouter);
module.exports=app;
