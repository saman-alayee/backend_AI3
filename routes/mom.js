const express = require("express");
const router = express.Router();
const { Mom, validateMom } = require("../models/mom");
const { Ticket } = require("../models/ticket");
const auth = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");

// Get all moms
router.get("/", adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const moms = await Mom.find()
      .sort({ timestamp: 1 })
      .skip(skip)
      .limit(limit);
    if (!moms || moms.length === 0)
      return res.status(404).json({ message: "No moms found." });

    const totalMoms = await Mom.countDocuments();

    res.status(200).json({
      totalMoms,
      totalPages: Math.ceil(totalMoms / limit),
      currentPage: page,
      moms,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new mom by admin
router.post("/", adminAuth, async (req, res) => {
  // Validate the request body
  const { error } = validateMom(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    // Check if the related ticket exists
    const ticket = await Ticket.findById(req.body.ticketId);
    if (!ticket) return res.status(404).json({ message: "Ticket not found." });

    // Create a new Mom instance
    const momData = new Mom({
      ticketId: req.body.ticketId,
      userId: req.body.userId,
      daart: req.body.daart,
      webengage: req.body.webengage,
      customer: req.body.customer,
    });

    // Save the new Mom instance to the database
    const savedMom = await momData.save();

    res.status(201).json(savedMom);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get moms by ticketId
router.get("/ticket/:ticketId", auth, async (req, res) => {
  try {
    const ticketId = req.params.ticketId;

    // Find MOMs by ticketId
    const moms = await Mom.find({ ticketId: ticketId });

    if (!moms || moms.length === 0) {
      return res
        .status(404)
        .json({ message: "No moms found for this ticket." });
    }

    res.status(200).json(moms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// delete mom
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const mom = await Mom.findByIdAndRemove(req.params.id);
    if (!mom) return res.status(404).send("mom not found.");
    res.send("mom deleted successfully.");
  } catch (error) {
    console.error("Error deleting mom:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Edit mom (only one field at a time)
router.put("/:id", adminAuth, async (req, res) => {
  try {
    const { ticketId, userId, daart, webengage, customer } = req.body;
    
    // Prepare an empty object to hold the updates
    const updates = {};

    // Add fields to the update object only if they are provided in the request body
    if (ticketId) updates.ticketId = ticketId;
    if (userId) updates.userId = userId;
    if (daart) updates.daart = daart;
    if (webengage) updates.webengage = webengage;
    if (customer) updates.customer = customer;

    // If no fields are provided, return a bad request
    if (Object.keys(updates).length === 0) {
      return res.status(400).send("Please provide at least one field to update.");
    }

    // Find the Mom instance by ID and update only the provided field(s)
    const updatedMom = await Mom.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedMom) {
      return res.status(404).send("Mom not found.");
    }

    res.status(200).json(updatedMom);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
