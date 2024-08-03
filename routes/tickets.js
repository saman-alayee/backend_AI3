const express = require("express");
const router = express.Router();
const { Ticket, validate, upload } = require("../models/ticket");
const { User, validateUser } = require('../models/user');
const auth = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");
const path = require("path");
const ExcelJS = require("exceljs");
const fs = require("fs");

/**
 * @swagger
 * tags:
 *   name: Tickets
 *   description: Ticket management endpoints
 */

/**
 * @swagger
 * /tickets:
 *   post:
 *     summary: Create a new ticket
 *     tags: [Tickets]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 description: Full name of the user
 *               email:
 *                 type: string
 *                 description: Email of the user
 *               company:
 *                 type: string
 *                 description: Company name
 *               licenseCode:
 *                 type: string
 *                 description: License code
 *               problemType:
 *                 type: string
 *                 description: Type of problem
 *               errorTime:
 *                 type: string
 *                 description: Error time
 *               request:
 *                 type: string
 *                 description: Request description
 *               requestTitle:
 *                 type: string
 *                 description: Request title
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file
 *     responses:
 *       201:
 *         description: Ticket created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ticket'
 *       400:
 *         description: Invalid input
 */
router.post("/",adminAuth, upload.single("image"), async (req, res) => {
  const uploadedFile = req.file;

  if (!uploadedFile) {
    return res.status(400).send("Please upload an image.");
  }

  const attachmentFileUrl = `${req.protocol}://${req.get("host")}/uploads/${
    uploadedFile.filename
  }`;
  const ticketData = {
    fullName: req.body.fullName,
    email: req.body.email,
    company: req.body.company,
    licenseCode: req.body.licenseCode,
    problemType: req.body.problemType,
    errorTime: req.body.errorTime,
    request: req.body.request,
    requestTitle: req.body.requestTitle,
    attachmentFile: attachmentFileUrl,
    assignedTo: "no one",
    // Save the image URL in the document
  };

  const validationResult = validate(ticketData);
  if (validationResult.error) {
    return res.status(400).send(validationResult.error.details[0].message);
  }

  const ticket = new Ticket(ticketData);

  try {
    await ticket.save();
    res.status(201).send(ticket);
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * @swagger
 * /tickets:
 *   get:
 *     summary: Get a list of tickets with pagination
 *     tags: [Tickets]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: A list of tickets
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 page:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 totalTickets:
 *                   type: integer
 *                 tickets:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Ticket'
 *       500:
 *         description: An error occurred while fetching tickets
 */
router.get("/", adminAuth, async (req, res) => {
  try {
    // Parse query parameters
    const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
    const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page if not provided
    const skip = (page - 1) * limit;

    // Fetch paginated tickets
    const tickets = await Ticket.find().skip(skip).limit(limit);

    // Get total number of tickets
    const totalTickets = await Ticket.countDocuments();

    // Calculate total pages
    const totalPages = Math.ceil(totalTickets / limit);

    // Send response with pagination metadata and tickets
    res.status(200).json({
      page,
      totalPages,
      totalTickets,
      tickets
    });
  } catch (error) {
    res.status(500).send("An error occurred while fetching tickets.");
  }
});

/**
 * @swagger
 * /tickets/{id}:
 *   delete:
 *     summary: Delete a ticket by ID
 *     tags: [Tickets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ticket ID
 *     responses:
 *       200:
 *         description: Ticket deleted successfully
 *       404:
 *         description: Ticket not found
 *       500:
 *         description: An error occurred while deleting the ticket
 */
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    // Find the request by ID
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).send("Ticket with the given ID was not found.");
    }

    // Remove the attachment file from the project folder
    if (ticket.attachmentFile) {
      const filePath = path.join(
        __dirname,
        "../uploads",
        path.basename(ticket.attachmentFile)
      );
      console.log(filePath);
      fs.unlinkSync(filePath); // when delete a ticket here i delete attachment file from uploads folder
    }

    // Delete the ticket
    await Ticket.findByIdAndRemove(req.params.id);

    res.send(ticket);
  } catch (error) {
    return res.status(500).send("An error occurred while deleting the ticket.");
  }
});

/**
 * @swagger
 * /tickets/exportToExcel:
 *   get:
 *     summary: Export tickets to Excel
 *     tags: [Tickets]
 *     responses:
 *       200:
 *         description: Excel file generated and sent
 *       500:
 *         description: An error occurred while exporting to Excel
 */
router.get("/exportToExcel", adminAuth, async (req, res) => {
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

/**
 * @swagger
 * /tickets/downloadExcel:
 *   get:
 *     summary: Download the exported Excel file
 *     tags: [Tickets]
 *     responses:
 *       200:
 *         description: Excel file downloaded
 *       500:
 *         description: An error occurred while downloading the Excel file
 */
router.get("/downloadExcel", adminAuth, (req, res) => {
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

/**
 * @swagger
 * /tickets/assign:
 *   put:
 *     summary: Assign a ticket to a user by email
 *     tags: [Tickets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ticketId:
 *                 type: string
 *                 description: The ID of the ticket to assign
 *                 example: 60d5ec49a2e6c03664dd3b88
 *               email:
 *                 type: string
 *                 description: The email of the user to assign the ticket to
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Ticket assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ticket'
 *       400:
 *         description: Ticket is already assigned or required fields are missing
 *       404:
 *         description: User or Ticket not found
 *       500:
 *         description: An error occurred while assigning the ticket
 */
router.put('/assign', adminAuth, async (req, res) => {
  const { ticketId, email } = req.body;

  if (!ticketId || !email) {
    return res.status(400).send("Ticket ID and user email are required.");
  }

  try {
    // Find the user by email
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).send("User not found");
    }

    // Find the ticket by ID
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).send("Ticket not found");
    }

    // Check if the ticket is already assigned
    if (ticket.assignedTo !== "no one") {
      return res.status(400).send("This ticket has already been assigned to another user.");
    }

    // Assign the ticket to the user if not already assigned
    ticket.assignedTo = user._id;
    await ticket.save();

    res.status(200).json(ticket);
  } catch (error) {
    res.status(500).send("An error occurred while assigning the ticket.");
  }
});

module.exports = router;
