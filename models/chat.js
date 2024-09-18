const Joi = require("joi");
const mongoose = require("mongoose");
const multer = require("multer");

// Define storage for image uploads using Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Specify the directory where uploaded files will be stored
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() +  "-" + "chat" + "-" + file.originalname); // Generate a unique filename for each uploaded file
  },
});

// Multer middleware
const upload = multer({ storage: storage });

// Define the Chat Schema
const chatSchema = new mongoose.Schema({
  ticketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ticket",
    required: true,
  },
  user: {
    type: String,
    required: true,
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
  attachmentFiles: {
    type: [String],
  },
  role: {
    type: String,
    required: true,
  },
});

// Create the Chat Model
const Chat = mongoose.model("Chat", chatSchema);

// Validate Chat Input
function validateChat(chat) {
  const schema = Joi.object({
    user: Joi.string().required(),
    message: Joi.string().max(500).required(),
    attachmentFiles: Joi.array().items(Joi.string().max(500)).optional(),
  });
  return schema.validate(chat);
}

// Export the multer upload and other components
module.exports = {
  Chat,
  validateChat,
  upload,  // Export upload middleware
};
