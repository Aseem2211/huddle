const express =require("express");
const app=express();
const path=require("path");
const cors=require("cors");
app.set("etag",false);
const allowed = (process.env.CLIENT_URL || "")
  .split(",")
  .map((s) => s.trim().replace(/\/$/, ""))
  .filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowed.includes(origin) || /\.vercel\.app$/.test(origin)) return cb(null, true);
    cb(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));
app.use((req,res,next)=>{
    res.set("Cache-Control","no-store")
    next();
});
app.use(express.json());
const roomRouter = require("./routes/roomroute.js");
const authrouter=require("./routes/authroute.js");
const dmrouter=require("./routes/dmroute.js");
app.get("/health",(req,res)=>res.json({ok:true}));
app.use("/api/auth",authrouter);
app.use("/api/rooms",roomRouter);
app.use("/uploads",express.static(path.join(__dirname,"../uploads")));
app.use("/api/conversations", require("./routes/conversationroute.js"));
app.use("/api/dm",dmrouter);
module.exports=app;
