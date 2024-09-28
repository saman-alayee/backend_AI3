// models/child.js
const mongoose = require("mongoose");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("config");

const childSchema = new mongoose.Schema(
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
    licenseCode: {
      type: String,
      maxlength: 124,
      unique: true,
    },
    company: {
        type: String,
        required: true,
        maxlength: 250,
      },
  },
  { timestamps: true }
);

// Method to generate auth token for child users
childSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { _id: this._id, role: "child" },
    config.get("jwtPrivateKey"),
    { expiresIn: "12h" }
  );
  return token;
};

// Validation function for the child schema
function validateChild(child) {
  const schema = Joi.object({
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(1024).required(),
    fullname: Joi.string().max(124).required(),
    licenseCode: Joi.string().max(124),
  });
  return schema.validate(child);
}

const Child = mongoose.model("Child", childSchema);

module.exports.Child = Child;
module.exports.validateChild = validateChild;
