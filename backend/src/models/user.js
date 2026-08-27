const pool=require("../config/db.js");
const User={
    async create({name,email,hashedPassword}){
        const [result]=await pool.query(
            "INSERT INTO users (name,email,hashedPassword) VALUES (?,?,?)",
            [name,email,hashedPassword]
        );
        return {id:result.insertId,name,email};
    },
    async findByEmail(email){
        const[rows]=await pool.query("SELECT * FROM  users WHERE email=?",[email]);
        return rows[0];
    },
    async findBYId(id){
        const [rows]=await pool.query("SELECT id,name,email,created_at FROM users WHERE id=? ",[id]);
        return rows[0];
    },

};
module.exports=User;