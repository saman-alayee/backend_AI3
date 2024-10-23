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
      bcc: "cs.maynd@gmail.com",
      subject: `تیم پشتیبانی مایند - بررسی پاسخ`,
      html: `
        <div style="direction: rtl; text-align: right;">
          <p> ${user.fullName} عزیز</p>
          <p> تیم ما به درخواست شما با شناسه ${user.ticketNumber} پاسخ داده است. لطفاً برای مشاهده پاسخ و پیگیریهای بیشتر، وارد پنل کاربری خود شوید. </p>
         <p> از اینکه با ما در ارتباط هستید سپاسگزاریم و امیدواریم پاسخ ما نیاز شما را برطرف کرده باشد. </p>
         <p>  در صورت نیاز به اطلاعات یا راهنمایی بیشتر، با ما در تماس باشید. </p>
            <p>با احترام،
            تیم پشتیبانی مایند</p>
            </div>
      `,
    });
    await user.save(); 
  } catch (error) {
    console.error("Error sending sendNotification:", error);
    throw new Error("Failed to send sendNotification. Please try again.");
  }
}

module.exports = sendNotification;
