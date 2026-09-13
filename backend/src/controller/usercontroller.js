const bcrypt=require("bcrypt");
const {User}=reuire("../models/user.js");
exports.updateProfileHandler=async(req,res)=>{
    try{
        const{name,email,password}=req.body;
        if(!name||!email||!password){
            return res.status(400).jason({message:"Name,email and password are required"});
        }
        const updateUser=await User.updateUser(req.user.id,{name,email,password});
        if(!updateUser){
            return res.status(404).json({message:"User not found"});
        }
        return res.status(200).json({message:"User updated successfully", user: updateUser});
    } catch (error) {
        console.error("Error updating user:", error);
        return res.status(500).json({message:"Internal server error"});
    }
};
exports.changePasswordHandler=async(req,res)=>{
    try{
        const {oldPassword,newPassword}=req.body;
        if(!newPassword||!oldPassword){
            return res.status(400).json({message:"old password and new password are required"});
        }
        if(newPassword.length<8){
            return res.status(400).json({message:"New password must be at least 8 characters long"});
        }
        const hash=await User.getUserPasswordHash(req.user.id);
        if(!hash){
            return res.status(404).json({message:"User not found"});
        }
        const isMatch=await bcrypt.compare(oldPassword,hash);
        if(!isMatch){
            return res.status(401).json({message:"Old password is incorrect"});
        }
        const newPasswordHash=await bcrypt.hash(newPassword,10);
        const isUpdated=await User.updatePassword(req.user.id,newPasswordHash);
        if(!isUpdated){
            return res.status(500).json({message:"Failed to update password"});
        }
        return res.status(200).json({message:"Password updated successfully"});
    } catch (error) {
        console.error("Error changing password:", error);
        return res.status(500).json({message:"Internal server error"});
    }
}