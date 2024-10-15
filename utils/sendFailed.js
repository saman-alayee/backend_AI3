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

async function sendFailed(user) {
  try {
    await transporter.sendMail({
      from: '"MAYND" <crm@maynd.ir>', // Ensure "From" address is correct
      to: user.email,
      subject: `تیم پشتیبانی مایند - عدم تأیید احراز هویت و فعالسازی حساب کاربری شما`,
      html: `
        <div style="direction: rtl; text-align: right;">
          <p> ${user.fullname} عزیز</p>
          <p> سلام</p>
          <p> ضمن تشکر از ثبت نام شما در پلتفرم پشتیبانی مایند، متاسفانه مراحل احراز هویت سازمان شما با موفقیت انجام نشد. این مورد ممکن است به دلیل عدم ثبت نام با ایمیل رسمی (سازمانی) شرکت جهت تشکیل اکانت مادر باشد، لطفا پس از بررسی این موضوع مجدد اقدام به ثبت نام فرمایید. </p>
          <p> با تشکر،
تیم پشتیبانی مایند</p>
           </div>
      `,
    });
  } catch (error) {
    console.error("Error sending sendFailed:", error);
    throw new Error("Failed to send sendFailed. Please try again.");
  }
}

module.exports = sendFailed;
