const {verifyToken}=require("../utils/jwt.js");
const authMiddleware=(req,res,next)=>{
    const authHeader=req.headers.authorization;
   if(!authHeader||!authHeader.startsWith("Bearer ")){
    return res.status(401).json({error:"No token provided"});
   }
   const token=authHeader.split(" ")[1];
   try{
    req.user=verifyToken(token);
    next();
   }catch(err){
    console.log(err);
    return res.status(401).json({error:"Invaid or exoired token"});
   }
};
module.exports=authMiddleware;