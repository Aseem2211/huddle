const { generateOtp } = require("../utils/otp.js");
const { sendOtpEmail } = require("../utils/mailer.js");
const { saveOtp, getValidOtp, deleteOtp } = require("../models/otpmodel.js");
const pool = require("../config/db.js");
const bcrypt = require("bcryptjs");
const User = require("../models/user.js");
const { generatedToken } = require("../utils/jwt.js");

const normEmail = (e) => String(e || "").trim().toLowerCase();

exports.signup = async (req, res) => {
  try {
    const { name, password } = req.body;
    const email = normEmail(req.body.email);
    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters long" });
    }

    const existing = await User.findByEmail(email);
    if (existing && existing.is_verified) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    if (existing) {
      // unverified leftover from an earlier attempt: let them start over
      await pool.query("UPDATE users SET name=?, password=? WHERE email=?", [name, hashedPassword, email]);
    } else {
      await pool.query(
        "INSERT INTO users (name,email,password,is_verified) VALUES (?,?,?,FALSE)",
        [name, email, hashedPassword]
      );
    }

    const otp = generateOtp();
    await saveOtp(email, otp, "signup");
    await sendOtpEmail(email, otp, "signup");

    res.status(201).json({ message: "Signup successful. Please verify the OTP sent to your email." });
  } catch (err) {
    console.error("signup error:", err);
    res.status(500).json({error: "Signup failed: " + err.message });
  }
};

exports.verifySignupOtp = async (req, res) => {
  try {
    const email = normEmail(req.body.email);
    const otp = String(req.body.otp || "").trim();
    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }
    const record = await getValidOtp(email, otp, "signup");
    if (!record) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }
    await pool.query("UPDATE users SET is_verified=TRUE WHERE email=?", [email]);
    await deleteOtp(email, "signup");
    res.status(200).json({ message: "Email verified. You can now log in." });
  } catch (err) {
    console.error("verify error:", err);
    res.status(500).json({ error: "Failed to verify OTP" });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const email = normEmail(req.body.email);
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      const otp = generateOtp();
      await saveOtp(email, otp, "reset_password");
      await sendOtpEmail(email, otp, "reset_password");
    }
    res.status(200).json({ message: "If that email is registered, a reset OTP has been sent." });
  } catch (err) {
    console.error("forgot error:", err);
    res.status(500).json({ error: "Failed to process request" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const email = normEmail(req.body.email);
    const otp = String(req.body.otp || "").trim();
    const { newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: "Email, OTP and new password are required" });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters long" });
    }
    const record = await getValidOtp(email, otp, "reset_password");
    if (!record) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password=? WHERE email=?", [hashedPassword, email]);
    await deleteOtp(email, "reset_password");
    res.status(200).json({ message: "Password reset successful. You can log in now." });
  } catch (err) {
    console.error("reset error:", err);
    res.status(500).json({ error: "Failed to reset password" });
  }
};

exports.resendSignupOtp = async (req, res) => {
  try {
    const email = normEmail(req.body.email);
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    const existingUser = await User.findByEmail(email);
    // same answer whether or not the account exists, so emails can't be probed
    if (existingUser && !existingUser.is_verified) {
      const otp = generateOtp();
      await saveOtp(email, otp, "signup");
      await sendOtpEmail(email, otp, "signup");
    }
    res.status(200).json({ message: "If that email needs verification, a new code has been sent." });
  } catch (err) {
    console.error("resend error:", err);
    res.status(500).json({ error: "Failed to resend OTP" });
  }
};

exports.login = async (req, res) => {
  try {
    const email = normEmail(req.body.email);
    const { password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    if (!user.is_verified) {
      return res.status(403).json({ error: "Please verify your email", needsVerification: true });
    }
    const token = generatedToken({ id: user.id, email: user.email });
    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (err) {
    console.error("login error:", err);
    return res.status(500).json({ error: "Login failed" });
  }
};

exports.getme = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch user" });
  }
};
