const axios = require("axios");

async function sendOtpEmail(toEmail, otp, purpose) {
  const subject =
    purpose === "signup" ? "Verify your Huddle account" : "Reset your Huddle password";

  try {
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: process.env.BREVO_SENDER_NAME || "Huddle",
          email: process.env.BREVO_SENDER_EMAIL,
        },
        to: [{ email: toEmail }],
        subject,
        htmlContent: `
          <div style="font-family:sans-serif;">
            <h2>${subject}</h2>
            <p>Your OTP is:</p>
            <h1 style="letter-spacing:4px;">${otp}</h1>
            <p>This OTP expires in 10 minutes. If you didn't request it, ignore this email.</p>
          </div>
        `,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY, // hyphen, not underscore
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        timeout: 15000,
      }
    );
  } catch (err) {
    console.error("Brevo send error:", err.response?.data || err.message);
    throw new Error("Failed to send OTP email");
  }
}

module.exports = { sendOtpEmail };
