const express = require("express");
const router = express.Router();
const { Ticket, validate, upload } = require("../models/ticket");
const { Admin } = require("../models/admin");
const auth = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");
const path = require("path");
const ExcelJS = require("exceljs");
const fs = require("fs");



router.post('/', auth, upload.array('images'), async (req, res) => {
  const uploadedFiles = req.files;

  if (!uploadedFiles || uploadedFiles.length === 0) {
    return res.status(400).send('Please upload at least one image.');
  }

  // Generate file URLs
  const attachmentFileUrls = uploadedFiles.map(file =>
    `${req.protocol}://${req.get('host')}/uploads/${file.filename}`
  );

  const ticketData = {
    fullName: req.body.fullName,
    email: req.body.email,
    company: req.body.company,
    licenseCode: req.body.licenseCode,
    problemType: req.body.problemType,
    errorTime: req.body.errorTime,
    request: req.body.request,
    requestTitle: req.body.requestTitle,
    attachmentFiles: attachmentFileUrls, // Use array of URLs
    assignedTo: 'no one',
    createdBy: req.userId,
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

// users tickets
router.get("/users", auth, async (req, res) => {
  try {
    const userId = req.userId;

    const page = parseInt(req.query.page) || 1; 
    const limit = parseInt(req.query.limit) || 10; 

    const skip = (page - 1) * limit;

    const tickets = await Ticket.find({ createdBy: userId }).sort({ createdAt: -1 }).skip(skip).limit(limit);

  
    const totalTickets = await Ticket.countDocuments({ createdBy: userId });
    res.status(200).json({
      totalTickets,
      totalPages: Math.ceil(totalTickets / limit),
      currentPage: page,
      tickets,
    });
  } catch (error) {
    console.error("Error retrieving tickets:", error);
    res.status(500).send("An error occurred while retrieving the tickets.");
  }
});

// single ticket of user 
router.get('/users/:id',auth,async (req,res) => {
  try {
    const userId = req.userId;
    const ticketId = req.params.id;

    const ticket = await Ticket.findOne({_id:ticketId,createdBy:userId});

    if(!ticket) {
      return res.status(404).send("Ticket not found ");
    }

    res.status(200).json(ticket);
  }
  catch (error) {
    console.error("Error retrieving ticket:", error);
    res.status(500).send("An error occurred while retrieving the ticket.");
  }
})
// admins assign tickets 
router.get("/myTickets", adminAuth, async (req, res) => {
  try {
    const adminId = req.adminId.toString();
    const page = parseInt(req.query.page) || 1;  
    const limit = parseInt(req.query.limit) || 10;  

    const tickets = await Ticket.find({ assignedTo: adminId })
      .sort({ createdAt: -1 })  
      .skip((page - 1) * limit)  
      .limit(limit);  

    if (tickets.length === 0) {
      return res.status(404).send("No tickets assigned to you.");
    }

    const totalTickets = await Ticket.countDocuments({ assignedTo: adminId });

    res.status(200).json({
      tickets,
      currentPage: page,
      totalPages: Math.ceil(totalTickets / limit),
      totalTickets,
    });
  } catch (error) {
    console.error("Error retrieving tickets:", error);
    res.status(500).send("An error occurred while retrieving the tickets.");
  }
});

// all tickets by made user
router.get("/", adminAuth, async (req, res) => {
  try {
    // Parse query parameters
    const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
    const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page if not provided
    const skip = (page - 1) * limit;

    const tickets = await Ticket.find().skip(skip).limit(limit);

    const totalTickets = await Ticket.countDocuments();

    const totalPages = Math.ceil(totalTickets / limit);

    // Send response with pagination metadata and tickets
    res.status(200).json({
      page,
      totalPages,
      totalTickets,
      tickets,
    });
  } catch (error) {
    res.status(500).send("An error occurred while fetching tickets.");
  }
});

router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).send("Ticket with the given ID was not found.");
    }

    // If the ticket has attachments, delete the files
    if (ticket.attachmentFiles && ticket.attachmentFiles.length > 0) {
      ticket.attachmentFiles.forEach(fileUrl => {
        const filePath = path.join(
          __dirname,
          "../uploads",
          path.basename(fileUrl) // Extracts the file name from the URL
        );

        // Check if the file exists and delete it
        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`File ${filePath} deleted successfully.`);
          } else {
            console.log(`File ${filePath} not found.`);
          }
        } catch (err) {
          console.error(`Error deleting file ${filePath}:`, err.message);
          return res
            .status(500)
            .send("An error occurred while deleting the associated file.");
        }
      });
    }

    // Delete the ticket from the database
    await Ticket.findByIdAndRemove(req.params.id);

    res.status(200).send("Ticket deleted successfully.");
  } catch (error) {
    console.error("Error in delete route:", error);
    return res.status(500).send("An error occurred while deleting the ticket.");
  }
});

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
      "Problem type",
      "Error time",
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
        req.requestTitle,
        req.request,
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

router.put("/assign", adminAuth, async (req, res) => {
  const { ticketId, email } = req.body;

  if (!ticketId || !email) {
    return res.status(400).send("Ticket ID and admin email are required.");
  }

  try {
    // Find the admin by email
    const admin = await Admin.findOne({ email: email });
    if (!admin) {
      return res.status(404).send("Admin not found");
    }

    // Find the ticket by ID
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).send("Ticket not found");
    }

    // Check if the ticket is already assigned
    if (ticket.assignedTo !== "no one") {
      return res
        .status(400)
        .send("This ticket has already been assigned to another admin.");
    }

    // Assign the ticket to the admin if not already assigned
    ticket.assignedTo = admin._id;
    await ticket.save();

    res.status(200).json(ticket);
  } catch (error) {
    res.status(500).send("An error occurred while assigning the ticket.");
  }
});

module.exports = router;
