const Joi = require("joi");
const mongoose = require("mongoose");

// Define the Chat Schema
const chatSchema = new mongoose.Schema({
    ticketId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ticket",
        required: true,
      },
      user: {
        type: String,
        required: true,  // The user's name or ID who sent the message
      },
      message: {
        type: String,
        required: true,
        maxlength: 1000,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
});

// Create the Chat Model
const Chat = mongoose.model("Chat", chatSchema);

// Validate Chat Input
function validateChat(chat) {
  const schema = Joi.object({
    user: Joi.string().required(),
    message: Joi.string().max(500).required(),
  });
  return schema.validate(chat);
}

module.exports = {
  Chat,        
  validateChat  
};
