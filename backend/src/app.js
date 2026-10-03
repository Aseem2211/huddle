const express =require("express");
const app=express();
const path=require("path");
const cors=require("cors");
app.set("etag",false);
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true,
}));
app.use((req,res,next)=>{
    res.set("Cache-Control","no-store");
    next();
});
app.use(express.json());
const roomRouter = require("./routes/roomroute.js");
const authrouter=require("./routes/authroute.js");
const dmrouter=require("./routes/dmroute.js");
app.use("/api/auth",authrouter);
app.use("/api/rooms",roomRouter);
app.use("/uploads",express.static(path.join(__dirname,"../uploads")));
app.use("/api/conversations", require("./routes/conversationroute.js"));
app.use("/api/dm",dmrouter);
module.exports=app;
