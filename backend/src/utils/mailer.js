const axios=require("axios");
async function sendOtpEmail(toEmail,Otp,purpose){
    const subject=
     purpose==="signup"?"Verify your Email":"Reset your password";
    try{
        await axios.post(
            "https://api.brevo.com/v3/smtp/email",
            {
                sender:{
                    name:process.env.BREVO_SENDER_NAME,
                    email:process.env.BREVO_SENDER_EMAIL,
                },
                to:[{email:toEmail}],
                subject,
                htmlContent:`
                <div style="font-family:sans-serif;">
                  <h2>${subject}</h2>
                  <p>Your OTP is:</p>
                  <h1 style="letter-spacing:4px;">${otp}</h1>
                  <p>This OTP expires in 10 minutes.</p>
                </div>
                `,
            },
            {
                headers:{
                    "api_key":process.env.BREVO_API_KEY,
                    "Content-Type":"application/json",
                    Accept:"application/json",
                },
            }
        );
    }catch(err){
      console.error("Brevo send error:",err.response?.data||err.message);
      throw new Error("Failed to send OtP email");
    }
   
}
module.exports={sendOtpEmail};