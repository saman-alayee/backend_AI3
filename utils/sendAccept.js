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
      bcc: "cs.maynd@gmail.com",
      subject: `تیم پشتیبانی مایند - تأیید احراز هویت و فعالسازی حساب کاربری شما`,
      html: `
        <div style="direction: rtl; text-align: right;">
          <p> ${user.fullname} عزیز</p>
          <p> سلام</p>
          <p> خوشحالیم که به ما پیوستید! </p>
          <p> مراحل احراز هویت سازمان شما با موفقیت انجام شد.حساب کاربری شما اکنون فعال است و شما میتوانید از این لحظه به تمام امکانات پلتفرم ما دسترسی داشته باشید. لطفا به پنل کاربری خود مراجعه کرده و از قسمت یوزر ها اقدام به اضافه کردن، افراد تیم خود فرمایید.</p>
         <p>برای ورود به حساب کاربری خود، به لینک زیر مراجعه کنید:</p>
         <a href="https://itk.maynd.ir/login"> https://itk.maynd.ir/login</a>
         <p>اگر هرگونه سوال یا نیاز به کمک بیشتری دارید، تیم پشتیبانی ما آماده پاسخگویی است. </p>   

          <p> با تشکر،
تیم پشتیبانی مایند</p>
           </div>
      `,
    });
  } catch (error) {
    console.error("Error sending sendAccept:", error);
    throw new Error("Failed to send sendAccept. Please try again.");
  }
}

module.exports = sendFailed;
