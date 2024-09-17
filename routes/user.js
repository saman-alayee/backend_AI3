const express = require("express");
const router = express.Router();
const { User, validateUser, validateOtp } = require("../models/user");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const superAdmin = require("../middleware/superAdmin");
const auth = require("../middleware/auth");
const sendOtp = require("../utils/sendOtp");
const config = require("config");
const jwt = require("jsonwebtoken");

router.get("/verify", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.send(user);
});

// Create a new user and send OTP
router.post("/", async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Check if the email already exists
  let existingUser = await User.findOne({ email: req.body.email });
  if (existingUser) {
    if (!existingUser.isVerified) {
      // User exists but is not verified, resend OTP
      await sendOtp(existingUser);
      return res.json({
        message:
          "حساب شما موجود می باشد اما ایمیل تان تایید نشده است . رمز یک بار مصرف برای شما ارسال شد.",
        isVerified: existingUser.isVerified,
        email: existingUser.email,
      });
    } else {
      // User already registered and verified
      return res.json({
        message: "حساب شما موجود می باشد لطفا وارد شوید.",
        isVerified: existingUser.isVerified,
        email: existingUser.email,
      });
    }
  }

  // Check if the licenseCode is used by another email
  const licenseCodeInUse = await User.findOne({
    licenseCode: req.body.licenseCode,
  });
  if (licenseCodeInUse && licenseCodeInUse.email !== req.body.email) {
    return res.status(400).send(
     
        "کد لایسنس در حال حاضر توسط ایمیل دیگری استفاده شده است. لطفاً از یک کد لایسنس منحصر به فرد استفاده کنید.",
    );
  }
  const user = new User(
    _.pick(req.body, [
      "email",
      "password",
      "fullname",
      "licenseCode",
      "company",
    ])
  );
  // Encrypt the password before saving
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  try {
    // Send OTP and then save the user
    await sendOtp(user);
    await user.save();

    res.status(200).json({
      message:
        "User registered successfully. Please verify your email with the OTP sent to you.",
      isVerified: user.isVerified,
      email: user.email,
    });
  } catch (ex) {
    console.error("Error saving the user:", ex);
    res.status(500).send("Internal server error.");
  }
});

// resend otp 
router.post("/resend-otp", async (req, res) => {
  const { email } = req.body;
  
  if (!email) return res.status(400).send("ایمیل را لطفا وارد کنید .");

  let user = await User.findOne({ email: email });
  if (!user) return res.status(404).send("کاربر یافت نشد.");

  if (user.isVerified) {
    return res.status(400).json({
      message: "اکانت شما تایید شده است . لطفا وارد شوید .",
      isVerified: user.isVerified,
      email: user.email,
    });
  }
  try {
    await sendOtp(user); 
    user.otpExpiration = Date.now() + 15 * 60 * 1000; 
    await user.save();
    res.json({
      message: "رمز یک بار مصرف برای شما ارسال شد.",
      isVerified: user.isVerified,
      email: user.email,
    });
  } catch (error) {
    console.error("Error resending OTP:", error);
    res.status(500).send("Internal server error.");
  }
});



// Verify OTP and activate the user
router.post("/otp", async (req, res) => {
  const { error } = validateOtp(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findOne({ email: req.body.email, otp: req.body.otp });
  if (!user) return res.status(400).send("Invalid OTP or email.");

  // Check if OTP is expired
  if (Date.now() > user.otpExpiration) {
    return res.status(400).send("OTP has expired.");
  }

  // Mark the user as verified and clear OTP fields
  user.isVerified = true;
  user.otp = null;
  user.otpExpiration = null;
  await user.save();

  const token = user.generateAuthToken();
  res
    .header("x-auth-token", token)
    .send(_.pick(user, ["_id", "email", "fullname", "licenseCode", "company"]));
});

router.get("/", superAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page
    const skip = (page - 1) * limit;

    const users = await User.find().sort("email").skip(skip).limit(limit);

    const totalUsers = await User.countDocuments();

    res.status(200).json({
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page,
      users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.put("/", async (req, res) => {
  try {
    const token = req.headers["authorization"];
    if (!token) return res.status(401).send("Access denied. No token provided.");

    let userId;
    try {
      const decoded = jwt.verify(token, config.get("jwtPrivateKey"));
      userId = decoded._id;
    } catch (ex) {
      return res.status(400).send("Invalid token.");
    }

    const { password } = req.body;
    if (!password) return res.status(400).send("New password is required.");

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update the password field using updateOne()
    await User.updateOne({ _id: userId }, { password: hashedPassword });

    res.send("رمز عبور با موفقیت بروز رسانی شد.");
  } catch (error) {
    console.error("Error updating password:", error);
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
