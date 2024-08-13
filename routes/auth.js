const express = require("express");
const router = express.Router();
const { User } = require("../models/user");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const config = require("config");
const sendOtp = require("../utils/sendOtp"); 


router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("کاربری با این ایمیل یافت نشد.");

  if (!user.isVerified) {
    // User exists but is not verified
    await sendOtp(user); // Resend OTP
    return res.json({
      message: "حساب کاربری شما تایید نشده است. لطفا کد ارسال شده را وارد کنید.",
      isVerified: false,
      email:user.email
      
    });
  }

  const validatePassword = await bcrypt.compare(req.body.password, user.password);
  if (!validatePassword) return res.status(400).send("رمز عبور اشتباه است.");

  const accessToken = jwt.sign(
    { _id: user._id, isUser: true,isVerified:true },
    config.get("jwtPrivateKey")
  );

  res.json({
    status: "success",
    role: "user",
    token: accessToken,
    username: user.name,
    id: user._id,
    email: user.email,
    isVerified:user.isVerified
  });
});



function validate(req) {
  const schema = Joi.object({
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(1024).required(),
  });
  return schema.validate(req);
}

module.exports = router;
