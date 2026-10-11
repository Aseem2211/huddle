const pool = require("../config/db.js");

// Expiry uses the database clock (NOW()) so Node/TiDB timezone differences can't break it.
async function saveOtp(email, otp, purpose) {
  await pool.query(
    "DELETE FROM otp_verifications WHERE email=? AND purpose=?",
    [email, purpose]
  );
  await pool.query(
    "INSERT INTO otp_verifications (email,otp,purpose,expires_at) VALUES (?,?,?,DATE_ADD(NOW(), INTERVAL 10 MINUTE))",
    [email, otp, purpose]
  );
}

async function getValidOtp(email, otp, purpose) {
  const [rows] = await pool.query(
    "SELECT * FROM otp_verifications WHERE email=? AND otp=? AND purpose=? AND expires_at>NOW() ORDER BY id DESC LIMIT 1",
    [email, otp, purpose]
  );
  return rows[0] || null;
}

async function deleteOtp(email, purpose) {
  await pool.query(
    "DELETE FROM otp_verifications WHERE email=? AND purpose=?",
    [email, purpose]
  );
}

module.exports = { saveOtp, getValidOtp, deleteOtp };
