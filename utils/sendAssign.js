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

async function sendAssign(user) {
  try {
    await transporter.sendMail({
      from: '"MAYND" <crm@maynd.ir>', // Ensure "From" address is correct
      to: user.email,
      subject: `تیم پشتیبانی مایند - ایشوی شما با موفقیت ثبت شد`,
      html: `
        <div style="direction: rtl; text-align: right;">
          <p> ${user.fullName} عزیز</p>
          <p>از اینکه با ما در ارتباط هستید، متشکریم.</p>
          <p>ایشو شما با شناسه ${user.ticketNumber} دریافت شده و در حال بررسی توسط کارشناسان ماست. تمام تلاش خود را خواهیم کرد تا در اسرع وقت آن را بررسی کرده و نتیجه را به اطلاع شما برسانیم.</p>
          <p>در صورت نیاز به اطلاعات بیشتر، لطفاً با ما در تماس باشید.</p>
        <p>با احترام،
تیم پشتیبانی مایند</p>
          </div>
      `,
    });
    await user.save(); // Save OTP and expiration time to the database after email is sent
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw new Error("Failed to send OTP. Please try again.");
  }
}

module.exports = sendAssign;
