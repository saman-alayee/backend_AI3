const Joi = require("joi");
const mongoose = require("mongoose");

const Request = mongoose.model(
  "Request",
  new mongoose.Schema({
    firstName: {
      type: String,
      required: true,
      maxlength: 20,
    },
    lastName: {
      type: String,
      required: true,
      maxlength: 50,
    },
    phone: {
      type: String,
      required: true,
      maxlength: 12,
    },
    email: {
      type: String,
      required: true,
      maxlength: 100,
    },
    company: {
      type: String,
      required: true,
      maxlength: 50,
    },
    service: {
      type: String,
      required: true,
      maxlength: 255,
    },
    domain: {
      type: String,
      required: true,
      maxlength: 100,
    },
    description: {
      type: String,
      maxlength: 200,
    },
    
  },{timestamps:true},
  )
);

function validateRequest(request) {
  const schema = Joi.object({
    firstName: Joi.string().max(20).required(),
    lastName: Joi.string().max(50).required(),
    phone: Joi.string().max(12).required(),
    email: Joi.string().email().max(100).required(),
    company: Joi.string().max(50).required(),
    service: Joi.string().max(255).required(),
    domain: Joi.string().max(100).required(),
    description: Joi.string().max(200),
  });
  const result = schema.validate(request);
  return result;
}

exports.Request = Request;
exports.validate = validateRequest;
