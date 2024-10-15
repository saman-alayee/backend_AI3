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

async function sendFinish(user) {
  try {
    await transporter.sendMail({
      from: '"MAYND" <crm@maynd.ir>', // Ensure "From" address is correct
      to: user.email,
      subject: `تیم پشتیبانی مایند- برطرف شدن چالش  `,
      html: `
        <div style="direction: rtl; text-align: right;">
          <p> ${user.fullName} عزیز</p>
          <p> سلام</p>
           <p> خوشحالیم به اطلاع شما برسانیم، ایشوی شما با شماره ${user.ticketNumber}  بررسی و حل مشکل مربوط به آن به پایان رسیده است. تیم ما تمام تلاش خود را کرده تا مشکل شما را با دقت و سرعت حل کند.</p>
           <p> در صورت وجود هر گونه سوال یا نیاز به پیگیری بیشتر، لطفاً با ما تماس بگیرید. همچنین ما همیشه آمادهایم تا برای ارائه خدمات بهتر در آینده به شما کمک کنیم.</p>
            <p> با تشکر از صبر و اعتماد شما.</p>
             <p> با احترام،
تیم پشتیبانی مایند</p>
           </div>
      `,
    });
    await user.save(); // Save OTP and expiration time to the database after email is sent
  } catch (error) {
    console.error("Error sending sendFinish:", error);
    throw new Error("Failed to send sendFinish. Please try again.");
  }
}

module.exports = sendFinish;
