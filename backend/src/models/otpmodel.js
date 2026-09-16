const {pool} =require("../config/db.js");
async function saveOtp(email,otp,purpose){
    const expiresAt=new Date(Date.now()+10*60*1000);
    await pool.query(
        "DELETE FROM otp_verifications WHERE email=? AND purpose=?",
        [email,purpose]
    );
    await pool.query(
        "INSERT INTO otp_verifications (email,otp,purpose,expires_at) VALUES (?,?,?,?",
        [email,otp,purpose,expiresAt]
    );
   
}
async function getValidOtp(email,otp,purpose){
    const [rows]=await pool.query(
        "SELECT * FROM otp_verifications WHERE email=? AND otp=? AND purpose=? AND expires_at>NOW()",
        [email,otp,purpose]
    );
    return rows[0]||null;
}
async function deleteOtp(email,purpose){
    await pool.query(
        "DELETE FROM otp_verifications WHERE email=? AND purpose=?",
        [email,purpose]
    );
}
module.exports={saveOtp,getValidOtp,deleteOtp}