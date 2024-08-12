const express = require("express");
const router = express.Router();
const { User, validateUser, validateOtp } = require("../models/user");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const superAdmin = require("../middleware/superAdmin");
const auth = require("../middleware/auth");
const sendOtp = require("../utils/sendOtp"); 






router.get("/verify", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.send(user);
});

// Create a new user and send OTP
router.post("/", async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) {
    if (!user.isVerified) {
      // User exists but is not verified, resend OTP
      await sendOtp(user);
      return res.status(400).json({
        message: "Account exists but is not verified. OTP resent.",
        isVerified: user.isVerified
      });
    } else {
      // User already registered and verified
      return res.status(400).json({
        message:"User already registered. Please log in.",
        isVerified:user.isVerified
      });
    }
  }

  // Create a new user if not existing
  user = new User(_.pick(req.body, ["email", "password", "fullname"]));
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  // Send OTP and then save the user
  await sendOtp(user);
  await user.save();

  res.json({
    message:"User registered. Please verify your email with the OTP sent to you.",
    isVerified:user.isVerified
  });
});



// Verify OTP and activate the user
router.post('/otp', async (req, res) => {
  const { error } = validateOtp(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findOne({ email: req.body.email, otp: req.body.otp });
  if (!user) return res.status(400).send('Invalid OTP or email.');

  // Check if OTP is expired
  if (Date.now() > user.otpExpiration) {
    return res.status(400).send('OTP has expired.');
  }

  // Mark the user as verified and clear OTP fields
  user.isVerified = true;
  user.otp = null;
  user.otpExpiration = null;
  await user.save();

  const token = user.generateAuthToken();
  res.header('x-auth-token', token).send(_.pick(user, ['_id', 'email', 'fullname']));
});


router.get("/", superAdmin, async (req, res) => {
  try {
    const users = await User.find().sort("email");
    res.send(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.put("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send("User not found.");

    if (req.body.email) user.email = req.body.email;
    await user.save();
    res.send(user);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).send("User not found.");
    res.send(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndRemove(req.params.id);
    if (!user) return res.status(404).send("User not found.");
    res.send("User deleted successfully.");
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
