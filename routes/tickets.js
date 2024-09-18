const express = require("express");
const router = express.Router();
const { Ticket, validate, upload } = require("../models/ticket");
const { Admin } = require("../models/admin");
const auth = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");
const path = require("path");
const fs = require("fs");
const ExcelJS = require('exceljs');
const sendAssign = require("../utils/sendAssign");
const sendFinish = require("../utils/sendFinish");



router.post('/', auth, upload.array('images'), async (req, res) => {
  const uploadedFiles = req.files;

  // if (!uploadedFiles || uploadedFiles.length === 0) {
  //   return res.status(400).send('Please upload at least one image.');
  // }

  // Generate file URLs
  const attachmentFileUrls = uploadedFiles?.map(file =>
    `${req.protocol}://${req.get('host')}/uploads/${file.filename}` || []
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
    assignedTo: 'هیچکس',
    assignedToName: 'هیچکس',
    status:'ثبت شده',
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

    // Initialize the filter with userId
    const filter = { createdBy: userId };

    // Filter by date (single day)
    if (req.query.date) {
      const date = new Date(req.query.date);

      if (isNaN(date.getTime())) {
        return res.status(400).send("Invalid date format. Use ISO 8601 format.");
      }

      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));

      filter.createdAt = {
        $gte: startOfDay,
        $lte: endOfDay,
      };
    }

    // Filter by status
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Filter by problemType
    if (req.query.problemType) {
      filter.problemType = req.query.problemType;
    }

    // Filter by company
    if (req.query.company) {
      filter.company = req.query.company;
    }

    // Filter by ticketNumber
    if (req.query.ticketNumber) {
      filter.ticketNumber = req.query.ticketNumber;
    }

    // Filter by search (applies to request title and request content)
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i'); // Case-insensitive search

      filter.$or = [
        { requestTitle: searchRegex },
        { ticketNumber: searchRegex },
        { company: searchRegex }
      ];
    }

    // Fetch tickets with filter, sort, skip, and limit
    const tickets = await Ticket.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);

    const totalTickets = await Ticket.countDocuments(filter);

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
    const skip = (page - 1) * limit;

    // Initialize the filter object
    const filter = { assignedTo: adminId };

    // Date range filter (startDate and endDate)
    if (req.query.date) {
      const date = new Date(req.query.date);

      if (isNaN(date.getTime())) {
        return res.status(400).send("Invalid date format. Use ISO 8601 format.");
      }

      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));

      filter.createdAt = {
        $gte: startOfDay,
        $lte: endOfDay,
      };
    }

    // Filter by status
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Filter by problemType
    if (req.query.problemType) {
      filter.problemType = req.query.problemType;
    }

    // Filter by company
    if (req.query.company) {
      filter.company = req.query.company;
    }

    // Filter by ticketNumber
    if (req.query.ticketNumber) {
      filter.ticketNumber = req.query.ticketNumber;
    }

    // Filter by search (applies to request title and request content)
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i'); // Case-insensitive search
      filter.$or = [
        { requestTitle: searchRegex },
        { ticketNumber: searchRegex },
        { company: searchRegex }
      ];
    }

    const tickets = await Ticket.find(filter)
      .sort({ createdAt: -1 })  // Sort by newest date first
      .skip(skip)  
      .limit(limit);  



    const totalTickets = await Ticket.countDocuments(filter);

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
    const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
    const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page if not provided
    const skip = (page - 1) * limit;

    // Initialize the filter object
    const filter = {};

    // Filter by date (single day)
    if (req.query.date) {
      const date = new Date(req.query.date);

      if (isNaN(date.getTime())) {
        return res.status(400).send("Invalid date format. Use ISO 8601 format.");
      }

      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));

      filter.createdAt = {
        $gte: startOfDay,
        $lte: endOfDay,
      };
    }

    // Filter by status
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Filter by problemType
    if (req.query.problemType) {
      filter.problemType = req.query.problemType;
    }

    // Filter by company
    if (req.query.company) {
      filter.company = req.query.company;
    }

    // Filter by ticketNumber
    if (req.query.ticketNumber) {
      filter.ticketNumber = req.query.ticketNumber;
    }

    // Filter by search (applies to request title and request content)
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i'); // Case-insensitive search

      filter.$or = [
        { requestTitle: searchRegex },
        { ticketNumber: searchRegex },
        { company: searchRegex }
      ];
    }

    // Fetch tickets with applied filters, sorting, and pagination
    const tickets = await Ticket.find(filter)
      .sort({ createdAt: -1 }) // Sort by newest date first
      .skip(skip)
      .limit(limit);

    const totalTickets = await Ticket.countDocuments(filter);

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

// excel export
router.get("/export/excel",adminAuth, async (req, res) => {
  try {
    // Fetch all tickets
    const tickets = await Ticket.find().sort({ createdAt: -1 });

    // Create a new Excel workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Tickets');

    // Define the columns
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 30 },
      { header: 'Full Name', key: 'fullName', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Company', key: 'company', width: 30 },
      { header: 'License Code', key: 'licenseCode', width: 20 },
      { header: 'Problem Type', key: 'problemType', width: 30 },
      { header: 'Error Time', key: 'errorTime', width: 20 },
      { header: 'Request', key: 'request', width: 30 },
      { header: 'Request Title', key: 'requestTitle', width: 30 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Attachment Files', key: 'attachmentFiles', width: 40 },
      { header: 'Assigned To', key: 'assignedTo', width: 20 },
      { header: 'Assigned To Name', key: 'assignedToName', width: 25 },
      { header: 'Created By', key: 'createdBy', width: 30 },
      { header: 'End Date', key: 'endDate', width: 20 },
      { header: 'Ticket Number', key: 'ticketNumber', width: 20 },
      { header: 'Created At', key: 'createdAt', width: 25, style: { numFmt: 'yyyy-mm-dd hh:mm:ss' } },
      { header: 'Updated At', key: 'updatedAt', width: 25, style: { numFmt: 'yyyy-mm-dd hh:mm:ss' } },
      { header: 'Time Taken', key: 'timeTaken', width: 20 },
    ];

    // Add rows to the worksheet
    tickets.forEach(ticket => {
      worksheet.addRow({
        id: ticket._id.toString(),
        fullName: ticket.fullName,
        email: ticket.email,
        company: ticket.company,
        licenseCode: ticket.licenseCode,
        problemType: ticket.problemType,
        errorTime: ticket.errorTime,
        request: ticket.request,
        requestTitle: ticket.requestTitle,
        status: ticket.status,
        attachmentFiles: ticket.attachmentFiles.join(', '), // Concatenate all attachments into a single cell
        assignedTo: ticket.assignedTo,
        assignedToName: ticket.assignedToName,
        createdBy: ticket.createdBy,
        endDate: ticket.endDate ? ticket.endDate.toISOString() : null,
        ticketNumber: ticket.ticketNumber,
        createdAt: ticket.createdAt.toISOString(),
        updatedAt: ticket.updatedAt.toISOString(),
        timeTaken: ticket.timeTaken,
      });
    });

    // Set the response headers for Excel download
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="tickets.xlsx"'
    );
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );

    // Write the workbook to the response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).send("An error occurred while exporting tickets.");
  }
});

// get single 
router.get("/:id", adminAuth, async (req, res) => {
  try {
    // Get ticket ID from the route parameters
    const ticketId = req.params.id;

    // Fetch the ticket from the database by ID
    const ticket = await Ticket.findById(ticketId);

    // If ticket is not found, return a 404 response
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // Send the found ticket as a response
    res.status(200).json(ticket);
  } catch (error) {
    res.status(500).send("An error occurred while fetching the ticket.");
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
    if (ticket.assignedTo !== "هیچکس") {
      return res
        .status(400)
        .send(" ایشوو توسط کارشناس دیگری در حال بررسی است.");
    }
    ticket.assignedTo = admin._id.toString();
    ticket.assignedToName = admin.fullname
    ticket.status = "در حال بررسی"
    await sendAssign(ticket)
    await ticket.save();

    res.status(200).json(ticket);
  } catch (error) {
    res.status(500).send("An error occurred while assigning the ticket.");
  }
});

// Route to change the status of a ticket to "finished" and save endDate
router.put("/:id/finish", adminAuth, async (req, res) => {
  try {
    const ticketId = req.params.id;

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return res.status(404).send("Ticket not found");
    }

    ticket.status = "حل شده";
    ticket.endDate = new Date(); 
    await sendFinish(ticket)

    await ticket.save();

    res.status(200).json(ticket);
  } catch (error) {
    console.error("Error finishing ticket:", error);
    res.status(500).send("An error occurred while updating the ticket status.");
  }
});

router.put("/:id", adminAuth, async (req, res) => {
  try {
    const ticketId = req.params.id;
    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return res.status(404).send("Ticket not found");
    }

    const { status } = req.body;

    if (!status) {
      return res.status(400).send("Status is required.");
    }

    ticket.status = status;
    await ticket.save();

    res.status(200).json(ticket);
  } catch (error) {
    console.error("Error updating ticket:", error);
    res.status(500).send("An error occurred while updating the ticket.");
  }
});

module.exports = router;
