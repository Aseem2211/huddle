const bcrypt=require("bcrypt");
const {User}=reuire("../models/user.js");
// controllers/userController.js (add this to your existing user controller)
const pool = require("../config/db.js");

exports.searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    const currentUserId = req.user.id; // from your auth middleware

    if (!q || q.trim().length === 0) {
      return res.json([]);
    }

    const searchTerm = `%${q.trim()}%`;

    const [rows] = await pool.query(
      `SELECT id, name, email, avatar_url
       FROM users
       WHERE (name LIKE ? OR email LIKE ?)
       AND id != ?
       LIMIT 20`,
      [searchTerm, searchTerm, currentUserId]
    );

    res.json(rows);
  } catch (err) {
    console.error("searchUsers error:", err);
    res.status(500).json({ message: "Search failed" });
  }
};
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
};
exports.uploadAvatar=async(req,res)=>{
    try{
        if(!req.file){
            return res.status(400).json({error:"No file uploaded"});
        }
        const avatarURL=`/uploads/avatars/${req.file.filename}`;
        await pool.query("UPDATE users SET avatar_url=? WHERE id=?",[
            avatarUrl,
            req.user.id,
        ]);
        res.status(200).json({
            message:"Profile picture updated",
            avatarUrl,
        });
    }catch(err){
        console.error(err);
        res.status(500).json({error:"Failed to upload avatar"});
    }
};
