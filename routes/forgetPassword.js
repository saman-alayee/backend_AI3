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
  const resetURL = `http://${req.headers.host}/reset-password/${token}`;

  const mailOptions = {
    from: "crm@maynd.ir",
    to: email,
    subject: "Password Reset",
    text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
    Please click on the following link, or paste this into your browser to complete the process:\n\n
    ${resetURL}\n\n
    If you did not request this, please ignore this email and your password will remain unchanged.\n`,
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
