const express = require("express");
const router = express.Router();
const { Ticket, validate, upload } = require("../models/ticket"); // Update the path
const auth = require("../middleware/auth")
const path = require("path");
const ExcelJS = require("exceljs");
const fs = require("fs");

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
router.delete("/:id", auth, async (req, res) => {
  try {
    // Find the request by ID
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).send("Ticket with the given ID was not found.");
    }

    // Remove the attachment file from the project folder
    if (ticket.attachmentFile) {
      const filePath = path.join(__dirname, "../uploads", path.basename(ticket.attachmentFile));
      console.log(filePath)
      fs.unlinkSync(filePath); // when delete a ticket here i delete attachment file from uploads folder
    }

    // Delete the ticket
    await Ticket.findByIdAndRemove(req.params.id);

    res.send(ticket);
  } catch (error) {
    return res
      .status(500)
      .send("An error occurred while deleting the ticket.");
  }
});


router.get("/exportToExcel", auth, async (req, res) => {
  try {
    // Fetch all requests from the database
    const tickets = await Ticket.find();

    // Create a new Excel workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Tickets");

    // Define headers for the Excel file
    

    const headers = [
      "Index",
      "Full name",
      "Email",
      "Company name",
      "Licence code",
      "Problem type ",
      "Error time",
      "Ticket number",
      "Request title",
      "Request",
      "Attachment",
      "Created At",
    ];
    worksheet.addRow(headers);

    // Add data rows to the worksheet
    tickets.forEach((req, index) => {
      worksheet.addRow([
        index + 1,
        req.fullName,
        req.email,
        req.company,
        req.licenseCode,
        req.problemType,
        req.errorTime,
        req.request,
        req.requestTitle,
        req.attachmentFile,
        req.createdAt.toISOString(), // Convert createdAt date to ISO format
      ]);
    });

    // Generate a file path for the Excel file
    const exportPath = path.join(__dirname, "../exports/tickets.xlsx"); // Change this path as needed

    // Save the Excel file
    await workbook.xlsx.writeFile(exportPath);

    res.sendFile(exportPath);
  } catch (error) {
    console.error("Error exporting to Excel:", error);
    res.status(500).send("An error occurred while exporting to Excel.");
  }
});

router.get("/downloadExcel", auth, (req, res) => {
  const filePath = path.join(__dirname, "../exports/tickets.xlsx"); // Change this path as needed

  res.download(filePath, "Tickets.xlsx", (err) => {
    if (err) {
      console.error("Error downloading Excel file:", err);
      res
        .status(500)
        .send("An error occurred while downloading the Excel file.");
    }
  });
});
module.exports = router;
