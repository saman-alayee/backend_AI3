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

async function sendNotification(user) {
  try {
    
    await transporter.sendMail({
      from: '"MAYND" <crm@maynd.ir>', // Ensure "From" address is correct
      to: user.email,
      subject: `ایشوی جدید`,
      html: `
        <div style="direction: rtl; text-align: right;">
          <p> سلام!</p>
          <p> ایشوی شما با شماره ..... پس از بررسی اولیه توسط تیم ما، جهت بررسی دقیقتر به ارائه دهنده سرویس ارجاع داده شده است و این ایمیل جهت اطلاعرسانی به شماست، ضمن تشکر از صبوری شما، ما در حال پیگیری این موضوع هستیم و به محض دریافت هرگونه بهروزرسانی از سمت سرویسدهنده، شما را در جریان خواهیم گذاشت.</p>
           <p> در صورت نیاز به جزئیات بیشتر، لطفاً با ما در تماس باشید.</p>
           <p> با تشکر از صبر و اعتماد شما.</p>
           <p> با احترام
تیم پشتیبانی مایند</p>
          </div>
      `,
    });
    await user.save();
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw new Error("Failed to send OTP. Please try again.");
  }
}

module.exports = sendNotification;
