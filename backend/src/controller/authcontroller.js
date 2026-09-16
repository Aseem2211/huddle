const {generateOtp}=require("../utils/otp.js");
const {sendOtpEmail}=require("../utils/mailer.js");
const {saveOtp,getValidOtp,deleteOtp}=require("../models/otpmodel.js");
const { pool }=require("../config/db.js");
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
        await pool.query(
            "INSERT INTO users (name,email,password,is_verified) VALUES(?,?,?,FALSE)",
            [name,email,hashedPassword]
        );
        const otp=generateOtp();
        await saveOtp(email,otp,"signup");
        await sendOtpEmail(email,otp,"signup");
        res.status(201).json({
            message:"Signup sucessful.Please verify the OTP sent to email id"
        });
       
    }catch(err){
        console.error(err);
        res.status(500).json({error:"Internal server error"});
    }
};
exports.verifySignupOtp=async(req,res)=>{
    try{
        const {email,otp}=req.body;
        const record=await getValidOtp(email,otp,"signup");
        if(!record){
            return res.status(400).json({message:"Invalid or expires Otp"});
        }
        await pool.query("UPDATE users SET is_verified=TRUE WHERE email=?",[email]);
        await deleteOtp(email,"signup");
        res.status(200).json({message:"Email verified. You can now log in."});

    }catch(err){
        res.status(500).json({message:"Failed to resend OTP",error:err.message});
    }

};
exports.forgotPassword=async(req,res)=>{
    try{
      const {email}=req.body;
      if(!email){
        return res.status(400).json({error:"Email is reqiuired"});
      }
      const existingUser=await User.findByEmail(email);
      if(!existingUser){
        return res.status(200).json({
            message:"if that email is registered, a reset OTP has been sent"
        });
      }
      const otp=generateOtp();
      await saveOtp(email,otp,"reset_password");
      await sendOtpEmail(email,otp,"reset_pasword");
      res.status(200).json({
        message:"If that email is registered , a reset OTP has been sent"
      });
    }catch(err){
        console.error(err);
        res.status(500).json({error:"Failed to process request"});
    }
};
exports.resetPassword=async(req,res)=>{
    try{
        const {email,otp,newPassword}=req.body;
        if(!email||!otp||!newPassword){
            return res.status(400).json({error:"Email,OTP,and new pasword required"});
        }
        if(newPassword.length<8){
            return res.status(400).json({error:"Password must be at leat 8 characters long"});
        }
        const record=await getValidOtp(email,otp,"reset_password");
        if(!record){
            return res.status(400).json({error:"Invalid or expired OTP"});
        }
        const hashedPassword=await bcrypt.hash(newPassword,10);
        await pool.query("UPDATE users SET password=? WHERE email=?",[hashedPassword,email]);
        await deleteOtp(email,"reset_password");
        res.status(200).json({message:"Password reset successful .You can login now"});   
    }catch(err){
        console.error(err);
        res.status(500).json({error:"Failed to reset password"});
    }
};
exports.resendSignupOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const existingUser = await User.findByEmail(email);
    if (!existingUser) {
      return res.status(404).json({ error: "No account found with this email" });
    }
    if (existingUser.is_verified) {
      return res.status(400).json({ error: "Email is already verified" });
    }

    const otp = generateOtp();
    await saveOtp(email, otp, "signup");
    await sendOtpEmail(email, otp, "signup");

    res.status(200).json({ message: "OTP resent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to resend OTP" });
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
       if(!user.is_verified){
        return res.status(403).json({message:"Please verify your email"});
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