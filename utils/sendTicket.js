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

async function sendTicket(user) {
  try {
    
    await transporter.sendMail({
      from: '"MAYND" <crm@maynd.ir>', // Ensure "From" address is correct
      to: user.email,
      subject: `ایشوی جدید`,
      html: `
        <div style="direction: rtl; text-align: right;">
          <p> سلام!</p>
          
         

          </div>
      `,
    });
    await user.save();
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw new Error("Failed to send OTP. Please try again.");
  }
}

module.exports = sendTicket;
