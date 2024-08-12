const nodemailer = require("nodemailer");

// Configure the transporter for Nodemailer
const transporter = nodemailer.createTransport({
  host: "smtp.zoho.eu",
  port: 465,
  secure: true,
  auth: {
    user: "crm@maynd.ir",
    pass: "1qaz!QAZ3edc#EDC",
  },
});

// Generate a 6-digit OTP
function generateOtp() {
  const otp = Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit OTP
  return otp.toString(); // Ensure OTP is returned as a string
}

// Function to send OTP to user's email
async function sendOtp(user) {
  const otp = generateOtp(); // Generate a 6-digit OTP
  user.otp = otp;
  user.otpExpiration = Date.now() + 15 * 60 * 1000; // OTP valid for 15 minutes

  try {
    await transporter.sendMail({
      from: '"MAYND" <crm@maynd.ir>', // Ensure "From" address is correct
      to: user.email,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otp}`,
    });
    await user.save(); // Save OTP and expiration time to the database after email is sent
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw new Error("Failed to send OTP. Please try again.");
  }
}

module.exports = sendOtp;
