const bcrypt=require("bcryptjs");
const User=require("../models/user.js");
const {generatedToken}=require("../utils/jwt.js");
exports.signup=async(req,res)=>{
    try{
        const{name,email,password}=req.body;
        if(!name||!email||!password){
            return res.status(400).json({error:"All fields are required"});
        }if(password.length<8){
            return res.status(400).json({error:"password must be atleast 8 characters long"});
        }
        const existingUser=await User.findByEmail(email);
        if(existingUser){
            return res.status(409).json({error:"Email already registered"});
        }
        const hashedPassword=await bcrypt.hash(password,10);
        const user=await User.create({name,email,password:hashedPassword});
        const token=generatedToken({id:user.id,email:user.email});
        res.status(201).json({
            token,
            user:{id:user.id,email:user.email,name:user.name},
        })
    }catch(err){
        console.error(err);
        res.status(500).json({error:"Internal server error"});
    }
};
exports.login=async(req,res)=>{
    try{
        const{email,password}=req.body;
       if(!email||!password){
        return res.status(400).json({error:"Email and password are required"});
       }
       const user=await User.findByEmail(email);
       if(!user){
        return res.status(401).json({error:"Invalid user or password"});
       }
       const isMatch=await bcrypt.compare(password,user.password);
       if(!isMatch){
        return res.status(401).json({error:"Invalid email or password"});
       }
       const token=generatedToken({id:user.id,email:user.email});
       res.json({
        token,
        user:{id:user.id,email:user.email,name:user.name},
       });
    }catch(err){
        console.log(err);
        return res.status(401).json({error:"Login failed"});
    }
};
exports.getme=async(req,res)=>{
    try{
       const user=await User.findById(req.user.id);
       if(!user){
        return res.status(404).json({error:"User not found"});
       }
       res.json(user); 
    }catch(err){
        console.log(err);
        return res.status(500).json({error:"Failed to fetch user"});
    }
};