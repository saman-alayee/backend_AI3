const mongoose = require("mongoose");
const Joi = require("joi");
const multer = require("multer");

// Define storage for image uploads using Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Specify the directory where uploaded files will be stored
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // Generate a unique filename for each uploaded file
  },
});

function generateTicketNumber() {
  const randomNumber = Math.floor(Math.random() * 100000000); // Generate a random number
  const ticketNumber = `${randomNumber}`; // Combine the prefix and random number
  return ticketNumber;
}

const upload = multer({ storage: storage });

const ticketSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      maxlength: 20,
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
    licenseCode: {
      type: String,
      required: true,
      maxlength: 255,
    },
    problemType: {
      type: String,
      required: true,
      maxlength: 30,
    },
    errorTime: {
      type: String,
      required: true,
      maxlength: 255,
    },
    ticketNumber: {
      type: String,
      default: generateTicketNumber,
      unique: true,
    },
    request: {
      type: String,
      required: true,
    },
    requestTitle: {
      type: String,
      required: true,
      maxlength: 255,
    },
    status: {
      type: String,
      default: "در حال بررسی",
    },
    attachmentFiles: {
      type: [String],
    },
    assignedTo: {
      type: String,
      default: "no one",
    },
    createdBy: {
      type: String,
      default: "",
    },
    endDate: {
      type: Date,
      default: null, // Optional field for end date
    },
  },
  { timestamps: true }
);

// Define a virtual field for time taken in days using endDate
ticketSchema.virtual('timeTaken').get(function () {
  if (!this.endDate || !this.createdAt) return null; // If either date is not set, return null

  const createdAt = new Date(this.createdAt);
  const endDate = new Date(this.endDate);
  const timeDifference = endDate - createdAt; // Time difference in milliseconds

  // Convert to days and ensure at least 1 day is shown
  const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
  return daysDifference > 0 ? daysDifference : 1; // Return 1 if difference is 0
});

// Ensure virtual fields are serialized
ticketSchema.set('toObject', { virtuals: true });
ticketSchema.set('toJSON', { virtuals: true });

function validateTicket(ticket) {
  const schema = Joi.object({
    fullName: Joi.string().max(20).required(),
    email: Joi.string().email().max(100).required(),
    company: Joi.string().max(50).required(),
    licenseCode: Joi.string().max(255).required(),
    problemType: Joi.string().max(30).required(),
    errorTime: Joi.string().max(255).required(),
    request: Joi.string().required(),
    requestTitle: Joi.string().max(255).required(),
    attachmentFiles: Joi.array().items(Joi.string().max(500)).optional(),
    assignedTo: Joi.string().optional(),
    createdBy: Joi.string().optional(),
    status: Joi.string().required(),
    endDate: Joi.date().iso().optional(),
  });
  const result = schema.validate(ticket);
  return result;
}

const Ticket = mongoose.model("Ticket", ticketSchema);

exports.Ticket = Ticket;
exports.validate = validateTicket;
exports.upload = upload; // Export the Multer upload middleware
