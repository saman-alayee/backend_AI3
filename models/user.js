const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const config = require("config");
const Joi = require("joi");

// Define the user schema
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 255,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 1024,
    },
    fullname: {
      type: String,
      required: true,
      maxlength: 124,
    },
    company: {
      type: String,
      maxlength: 250,
    },
    licenseCode: {
      type: String,
      maxlength: 124,
    },
    phone: {
      type: String,
      maxlength: 124,
      default: null,
    },
    otp: {
      type: String,
      maxlength: 6,
      required: function () {
        return this.role === "user" && !this.isVerified; // Only required if user is not verified
      },
      default: null,
    },
    otpExpiration: {
      type: Date,
      required: function () {
        return this.role === "user" && !this.isVerified; // Only required if user is not verified
      },
      default: null,
    },
    isAdminVerified: {
      type: Boolean,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      required: true,
      enum: ["user", "child"],
      default: "user",
    },
    children: [
      {
        email: { type: String, required: true },
        _id: { type: mongoose.Schema.Types.ObjectId, required: true },
        fullname: { type: String, required: true },
        company: { type: String, required: false },
        role: { type: String, required: true, default: "child" },
      },
    ],
    motherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// Validation functions
function validateUser(user) {
  const schema = Joi.object({
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(1024).required(),
    fullname: Joi.string().max(124).required(),
    company: Joi.string().max(250).required(),
    phone: Joi.string().max(124).optional().allow(null, ""),
    licenseCode: Joi.string().max(124).required(),
    otp: Joi.string().length(6).allow(null),
    otpExpiration: Joi.date().allow(null),
    motherId: Joi.string().length(24).allow(null),
  });
  return schema.validate(user);
}

function validateOtpFields(user) {
  const schema = Joi.object({
    otp: Joi.string().length(6).required(),
    otpExpiration: Joi.date().required(),
  });
  return schema.validate({ otp: user.otp, otpExpiration: user.otpExpiration });
}

function validateOtp(otpRequest) {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).required(),
  });
  return schema.validate(otpRequest);
}

// Pre-save validation
userSchema.pre("save", function (next) {
  if (this.role === "user" && this.motherId) {
    return next(new Error("User cannot have a motherId."));
  }
  if (this.role === "child" && !this.motherId) {
    return next(new Error("Child must have a motherId."));
  }
  next();
});

// Token generation method
userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { _id: this._id, role: this.role },
    config.get("jwtPrivateKey"),
    { expiresIn: "12h" }
  );
  return token;
};

// User model
const User = mongoose.model("User", userSchema);

// Export model and validation functions
module.exports = { User, validateUser, validateOtp, validateOtpFields };
