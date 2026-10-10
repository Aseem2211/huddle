require("dotenv").config();
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 4000,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  ssl: {
    minVersion: "TLSv1.2",
    rejectUnauthorized: true,
  },
});

pool
  .query("SELECT 1")
  .then(() => console.log("DB connected:", process.env.DB_HOST))
  .catch((err) =>
    console.error("DB connection failed:", err.code, err.message)
  );

module.exports = pool;
