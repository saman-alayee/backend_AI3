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
    assignedTo: 'no one',
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
    if (ticket.assignedTo !== "no one") {
      return res
        .status(400)
        .send("قبلا گردن گرفتن ");
    }

    // Assign the ticket to the admin if not already assigned
    ticket.assignedTo = admin._id;
    ticket.status = "در حال بررسی"
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
