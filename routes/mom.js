const express = require("express");
const router = express.Router();
const { Mom, validateMom } = require("../models/mom");
const { User } = require("../models/user");
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

    // Search query parameters (e.g., title, company)
    const searchQuery = {};
    if (req.query.title) {
      searchQuery.title = { $regex: req.query.title, $options: "i" }; // Case-insensitive regex search
    }
    if (req.query.company) {
      searchQuery.company = { $regex: req.query.company, $options: "i" }; // Case-insensitive regex search
    }

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

// get single mom
router.get("/:id", adminAuth, async (req, res) => {
  try {
    const momId = req.params.id;

    const mom = await Mom.findById(momId);

    if (!mom) {
      return res.status(404).json({ message: "mom not found" });
    }

    res.status(200).json(mom);
  } catch (error) {
    res.status(500).send("An error occurred while fetching the mom.");
  }
});

// Create a new mom by admin
router.post("/", adminAuth, async (req, res) => {
  // Validate the request body
  const { error } = validateMom(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    // Check if the related user exists
    const user = await User.findById(req.body.userId);
    if (!user)
      return res.status(404).json({ message: "کاربر موجود نمی باشد ." });

    // Create a new Mom instance
    const momData = new Mom({
      userId: req.body.userId,
      daart: req.body.daart,
      webengage: req.body.webengage,
      customer: req.body.customer,
      company: req.body.company,
      title: req.body.title,
      description: req.body.description,
      date: req.body.date,
    });

    // Save the new Mom instance to the database
    const savedMom = await momData.save();

    res.status(201).json(savedMom);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get moms by userId
router.get("/users/:userId", auth, async (req, res) => {
  try {
    const userId = req.params.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    // Find MOMs by userId
    const moms = await Mom.find({ userId: userId })
      .sort({ timestamp: 1 })
      .skip(skip)
      .limit(limit);

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

// get single mom is user side
router.get("/users/:userId/moms/:momId", auth, async (req, res) => {
  try {
    const { userId, momId } = req.params;

    // Find a specific MOM by userId and momId
    const mom = await Mom.findOne({ _id: momId, userId: userId });

    if (!mom) {
      return res.status(404).json({ message: "Mom not found for this user." });
    }

    res.status(200).json(mom);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// delete mom
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const mom = await Mom.findByIdAndRemove(req.params.id);
    if (!mom) return res.status(404).send("هیچ صورت جلسه ای موجود نمی باشد");
    res.send("صورت جلسه با موفقیت پاک شد .");
  } catch (error) {
    console.error("Error deleting mom:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Edit mom (only one field at a time)
router.put("/:id", adminAuth, async (req, res) => {
  try {
    const { daart, webengage, customer, company, title, description, date } =
      req.body;

    // Prepare an empty object to hold the updates
    const updates = {};

    // Add fields to the update object only if they are provided in the request body
    if (daart) updates.daart = daart;
    if (webengage) updates.webengage = webengage;
    if (customer) updates.customer = customer;
    if (company) updates.company = company;
    if (title) updates.title = title;
    if (description) updates.description = description;
    if (date) updates.date = date;
    // If no fields are provided, return a bad request
    if (Object.keys(updates).length === 0) {
      return res.status(400).send("حداقل یک فیلد باید تغییر کند .");
    }

    const updatedMom = await Mom.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedMom) {
      return res.status(404).send("هیچ صورت جلسه ای موجود نمی باشد");
    }

    res.status(200).json(updatedMom);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
