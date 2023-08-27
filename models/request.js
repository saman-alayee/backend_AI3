const Joi = require("joi");
const mongoose = require("mongoose");

const Request = mongoose.model(
  "Request",
  new mongoose.Schema({
    firstName: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 255,
    },
    lastName: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 255,
    },
    phone: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 20,
    },
    email: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 255,
    },
    company: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 255,
    },
    service: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 255,
    },
  },
  {timestamps:true})
);
function validateRequest(request) {
  const schema = Joi.object({
    firstName: Joi.string().min(5).max(50).required(),
    lastName: Joi.string().min(5).max(50).required(),
    phone: Joi.string().min(6).max(20).required(),
    email: Joi.string().email().min(5).max(255).required(),
    company: Joi.string().min(5).max(255).required(),
    service: Joi.string().min(3).max(255).required(),
  });
  const result = schema.validate(request);
  return result;
}

exports.Request = Request;
exports.validate = validateRequest;
