const express = require("express");
const router = express.Router();
const { Mom, validateMom } = require("../models/mom");
const { Ticket } = require("../models/ticket");
const auth = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");


// Get all moms
router.get("/",adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const moms = await Mom.find().sort({ timestamp: 1 }).skip(skip).limit(limit);
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
router.post("/",auth, async (req, res) => {
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
      return res.status(404).json({ message: "No moms found for this ticket." });
    }

    res.status(200).json(moms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
module.exports = router;
