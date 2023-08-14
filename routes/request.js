const { Request, validate } = require("../models/request");
const express = require("express");
const nodemailer = require("nodemailer"); // Don't forget to require nodemailer
const router = express.Router();

// Create a Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", // Use the SMTP host of the email service (e.g., Gmail)
  port: 465,
  secure: true,
  auth: {
    user: 'saman.alaii10@gmail.com', // Replace with your Gmail email
    pass: '66678141', // Replace with your Gmail password
  }
});

router.get("/", async (req, res) => {
  const requests = await Request.find().sort("name");
  res.send(requests);
});

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    const request = new Request({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phone: req.body.phone,
      email: req.body.email,
      company: req.body.company,
      service: req.body.service,
    });

    // Save the request to the database
    await request.save();

    // Send an email
    const mailOptions = {
      from: 'saman.alaii10@gmail.com', // Replace with your Gmail email
      to: 'saman.alaii8@gmail.com', // Replace with the actual recipient email
      subject: 'Form Submission',
      text: `
        Name: ${req.body.firstName} ${req.body.lastName}
        Email: ${req.body.email}
        Phone: ${req.body.phone}
        Company: ${req.body.company}
        Service: ${req.body.service}
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    res.sendStatus(200); // Successful form submission
  } catch (error) {
    console.error('Error sending email:', error);
    res.sendStatus(500); // Internal server error
  }
});

module.exports = router;
