const Joi = require("joi");
const mongoose = require("mongoose");

// Define the mom Schema
const momSchema = new mongoose.Schema({
    ticketId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ticket",
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
    ticketId: Joi.string().required(),
    daart: Joi.string().required(),
    webengage: Joi.string().required(),
    customer: Joi.string().required(),
  });
  return schema.validate(mom);
}

module.exports = {
  Mom,        
  validateMom  
};
