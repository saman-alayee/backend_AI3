const Joi = require("joi");
const mongoose = require("mongoose");

// Define the mom Schema
const momSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      daart: {
        type: String,
        required: true,
      },
      webengage: {
        type: String,
        required: true,
      },
      customer: {
        type: String,
        required: true,
      },
      title: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      company: {
        type: String,
        required: true,
      },
      date: {
        type: String,
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
});

// Create the mom Model
const Mom = mongoose.model("Mom", momSchema);

// Validate Mom Input
function validateMom(mom) {
  const schema = Joi.object({
    userId: Joi.string().required(),
    title: Joi.string().required(),
    description: Joi.string().required(),
    daart: Joi.string().required(),
    webengage: Joi.string().required(),
    company: Joi.string().required(),
    date: Joi.string().required(),
    customer: Joi.string().required(),
  });
  return schema.validate(mom);
}

module.exports = {
  Mom,        
  validateMom  
};
