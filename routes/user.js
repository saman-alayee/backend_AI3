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



// user info with token
router.get("/verify", auth, async (req, res) => {
  const user = await User.findById(req.userId).select("-password");
  res.send(user);
});

// children list 
router.get("/children", auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page
    const skip = (page - 1) * limit;

    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).send("User not found.");
    }

    const totalChildren = user.children.length;
    const paginatedChildren = user.children.slice(skip, skip + limit);

    res.status(200).json({
      totalChildren,
      totalPages: Math.ceil(totalChildren / limit),
      currentPage: page,
      children: paginatedChildren,
    });
  } catch (error) {
    console.error("Error fetching user's children:", error);
    res.status(500).send("Internal Server Error");
  }
});


// Create a new user and send OTP
router.post("/", async (req, res) => {
  // Validate user input
  const { error } = validateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Check if the email already exists
  let existingUser = await User.findOne({ email: req.body.email });
  if (existingUser) {
    if (!existingUser.isVerified) {
      // User exists but is not verified, resend OTP
      await sendOtp(existingUser);
      return res.json({
        message: "حساب شما موجود می باشد اما ایمیل تان تایید نشده است . رمز یک بار مصرف برای شما ارسال شد.",
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

  // // Check if the licenseCode is used by another email
  // const licenseCodeInUse = await User.findOne({
  //   licenseCode: req.body.licenseCode,
  // });
  // if (licenseCodeInUse && licenseCodeInUse.email !== req.body.email) {
  //   return res.status(400).send(
  //     "کد لایسنس در حال حاضر توسط ایمیل دیگری استفاده شده است. لطفاً از یک کد لایسنس منحصر به فرد استفاده کنید."
  //   );
  // }

  // Create a new user object
  const user = new User({
    email: req.body.email,
    password: req.body.password,
    fullname: req.body.fullname,
    licenseCode: req.body.licenseCode,
    company: req.body.company,
    role: "user", // Default to 'user'
    otp: (req.body.role === "user") ? null : undefined, // Set to null for child
    otpExpiration: (req.body.role === "user") ? null : undefined, // Set to null for child
  });
  

  // Encrypt the password before saving
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  try {
    // Send OTP and then save the user
    await sendOtp(user);
    await user.save();

    res.status(200).json({
      message: "User registered successfully. Please verify your email with the OTP sent to you.",
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

// Add Child User
router.post("/add-child", auth, async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    const mother = await User.findOne({ _id: req.userId, role: 'user' });
    if (!mother) {
      return res.status(404).send("اکانت مادر پیدا نشد .");
    }
    if(mother.licenseCode !== req.body.licenseCode){
      return res.status(404).send("لایسنس کد کاربر با لایسنس کاربر مادر یکی نمی باشد .")
    }

    const existingChild = await User.findOne({
      email: req.body.email,
      motherId: req.userId,
    });

    if (existingChild) {
      return res.status(400).send("این کاربر قبلا اضافه شده است .");
    }

    const childUser = new User({
      ...req.body,
      role: "child",
      otp: null, // Explicitly set to null
      otpExpiration: null, // Explicitly set to null
      motherId: req.userId,
      isVerified:true // Set the motherId to the authenticated user's ID
    });

    const salt = await bcrypt.genSalt(10);
    childUser.password = await bcrypt.hash(childUser.password, salt);

    await childUser.save();

    const childInfo = {
      email: childUser.email,
      _id: childUser._id,
      fullname: childUser.fullname,
      company: childUser.company,
      role: childUser.role,
    };

    await User.findByIdAndUpdate(req.userId, { $push: { children: childInfo } });

    res.status(201).send({
      message: "کاربر با موفقیت اضافه شد .",
      child: childInfo,
    });
  } catch (ex) {
    // Handle MongoDB duplicate email error
    if (ex.code === 11000 && ex.keyPattern && ex.keyPattern.email) {
      return res.status(400).send("ایمیل موجود می باشد .");
    }

    console.error("Error adding child user:", ex);
    res.status(500).send("Internal server error.");
  }
});






// Verify OTP and activate the user
router.post("/otp", async (req, res) => {
  const { error } = validateOtp(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user || user.otp !== req.body.otp) {
      return res.status(400).send("ایمیل یا رمز یک بار مصرف اشتباه می باشد .");
    }

    if (Date.now() > user.otpExpiration) {
      return res.status(400).send("رمز یک بار مصرف منقضی شده است .");
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiration = null;

    await user.save();

    const token = user.generateAuthToken();
    res.header("x-auth-token", token).send(_.pick(user, ["_id", "email", "fullname", "licenseCode", "company"]));
  } catch (ex) {
    console.error("Error during OTP verification:", ex);
    res.status(500).send("Internal server error.");
  }
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
    if (!password) return res.status(400).send("رمز جدید را باید وارد کنید .");

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
    if (!user) return res.status(404).send("کاربر پیدا نشد .");
    res.send(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndRemove(req.params.id);
    if (!user) return res.status(404).send("کاربر پیدا نشد .");
    res.send("کاربر با موفقیت پاک شد .");
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).send("Internal Server Error");
  }
});


// delete child 
router.delete("/delete-child/:id", auth, async (req, res) => {
  const { id } = req.params;

  try {
    const motherUser = await User.findById(req.userId);

    if (!motherUser) {
      return res.status(404).send("کاربر اصلی پیدا نشد.");
    }

    const childIndex = motherUser.children.findIndex((child) => child._id.toString() === id);

    if (childIndex === -1) {
      return res.status(404).send("این کاربر در لیست زیر مجموعه های شما نمی باشد.");
    }

    // Remove the child from the mother's children array
    motherUser.children.splice(childIndex, 1);

    await motherUser.save();

    await User.findByIdAndDelete(id);

    res.status(200).send("کاربر زیر مجموعه شما با موفقیت پاک شد .");
  } catch (error) {
    console.error("Error deleting child user:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
