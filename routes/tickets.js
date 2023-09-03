const express = require("express");
const router = express.Router();
const { Ticket, validate, upload } = require("../models/ticket"); // Update the path

// Define your route for handling the ticket creation with image upload
router.post("/", upload.single("image"), async (req, res) => {
  // Handle the image file here and save its URL in the MongoDB document
  const uploadedFile = req.file;

  // Check if an image was uploaded
  if (!uploadedFile) {
    return res.status(400).send("Please upload an image.");
  }

  // Construct the image URL based on your server's configuration
  const attachmentFileUrl = `${req.protocol}://${req.get("host")}/uploads/${uploadedFile.filename}`;

  // Generate a unique 5-digit ticket number

  const ticketData = {
    // Populate other ticket fields based on your form data
    fullName: req.body.fullName,
    email: req.body.email,
    company: req.body.company,
    licenseCode: req.body.licenseCode,
    problemType: req.body.problemType,
    errorTime: req.body.errorTime,
    request: req.body.request,
    requestTitle: req.body.requestTitle,
    attachmentFile: attachmentFileUrl, // Save the image URL in the document
  };

  // Validate the ticket data
  const validationResult = validate(ticketData);
  if (validationResult.error) {
    return res.status(400).send(validationResult.error.details[0].message);
  }

  // Create a new ticket with the validated data
  const ticket = new Ticket(ticketData);

  try {
    await ticket.save();
    res.status(201).send(ticket);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/", async (req, res) => {
  try {
    const tickets = await Ticket.find();
    res.status(200).send(tickets);
  } catch (error) {
    res.status(500).send("An error occurred while fetching tickets.");
  }
});

module.exports = router;
