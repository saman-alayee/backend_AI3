const express = require("express");
const nodemailer = require("nodemailer");
const Joi = require("joi");
const { User } = require("../models/user");
const router = express.Router();

// Create a transporter object using the specified SMTP transport
const transporter = nodemailer.createTransport({
  host: "smtp.zoho.eu",
  port: 465,
  secure: true,
  auth: {
    user: "crm@maynd.ir",
    pass: "1qaz!QAZ3edc#EDC",
  },
});

// Define the email validation schema
const validateEmail = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
  });
  return schema.validate(data);
};


router.post("/", async (req, res) => {
  const { error } = validateEmail(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const { email } = req.body;
  let user = await User.findOne({ email: email });
  if (!user) return res.status(400).send("User not found");

  const token = user.generateAuthToken();
  const resetURL = `http://localhost:5173/reset-password/${token}`;

  const mailOptions = {
    from: "crm@maynd.ir",
    to: email,
    subject: "درخواست تغییر رمز عبور شما",
    html: `
      <div dir="rtl" style="text-align: right; font-family: Arial, sans-serif;">
        <p>سلام کاربر عزیز،</p>
        <p>درخواست شما برای تغییر رمز عبور دریافت شد. لطفاً از لینک زیر جهت ادامه فرآیند تغییر رمز عبور استفاده کنید:</p>
        <p><a href="${resetURL}">${resetURL}</a></p>
        <p>این لینک فقط به مدت 5 دقیقه معتبر است. اگر این درخواست از سمت شما انجام نشده است، لطفاً هر چه سریع‌تر با پشتیبانی ما تماس بگیرید.</p>
        <p>با تشکر،<br>
        تیم پشتیبانی مایند</p>
      </div>
    `,
  };
  
  

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", {
      to: mailOptions.to,
      subject: mailOptions.subject,
      messageId: info.messageId,
      response: info.response,
    });
    res.json({
      status: "success",
      messageId: info.messageId,
      response: info.response,
    });
  } catch (error) {
    res.status(500).send("Error sending email: " + error.message);
  }
});

module.exports = router;
