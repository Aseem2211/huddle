const pool=require("../config/db.js");
const User={
    async create({name,email,password}){
        const [result]=await pool.query(
            "INSERT INTO users (name,email,password) VALUES (?,?,?)",
            [name,email,password]
        );
        return {id:result.insertId,name,email};
    },
    async findByEmail(email){
        const[rows]=await pool.query("SELECT * FROM  users WHERE email=?",[email]);
        return rows[0];
    },
    async findById(id){
        const [rows]=await pool.query("SELECT id,name,email,avatar_url,created_at FROM users WHERE id=? ",[id]);
        return rows[0];
    },
    async updateUser(userId,{name,email,password}){
        const [result]=await pool.query(
            `UPDATE user SET name=?,email=?,password=? WHERE id=?`,
            [name,email,password,userId]
        );
        if(result.affectedrows===0){
            return NULL;
        }
        const [rows]=await pool.query("SELECT id,name,email,created_at FROM users WHERE id=?",[userId]);
        return rows[0];
    },
    async getUserPasswordHash(userId){
        const [rows]=await pool.query(
            `SELECT password FROM user WHERE id=?`[userId]
        );
            return rows[0]?.password||null;
        
    },
    async updatePassword(userId,newPasswordHash){
        const [result]=await pool.query(
            `UPDATE user SET password=? WHERE id=?`,
            [newPasswordHash,userId]
        );
        return result.affectedRows > 0;
    }
};
module.exports=User;