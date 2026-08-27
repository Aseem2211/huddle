const jwt=require("jsonwebtoken");
require("dotenv").config();
const generatedToken=(payload)=>{
    return jwt.sign(payload,process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXPIRES_IN});
};
const verifyToken=(token)=>{
    jwt.verify(token,process.env.JWT_SECRET);   
};
module.exports={generatedToken,verifyToken};