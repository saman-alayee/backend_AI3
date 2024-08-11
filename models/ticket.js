const Joi = require("joi");
const mongoose = require("mongoose");
const multer = require("multer");
const jalaali = require("jalaali-js");

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

const Ticket = mongoose.model(
  "Ticket",
  new mongoose.Schema(
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
        default: generateTicketNumber, // Generate a ticket number when creating a new ticket
        unique: true, // Ensure uniqueness of ticket numbers
      },
      request: {
        type: String,
        required: true,
        maxlength: 255,
      },
      requestTitle: {
        type: String,
        required: true,
        maxlength: 255,
      },
      attachmentFiles: {
        type: [String], // Array of strings for multiple image URLs
      },
      assignedTo: {
        type: String,
        default: "no one",
      },
      createdBy: {
        type: String,
        default: "",
      }, 
    },
    { timestamps: true }
  )
);

Ticket.schema.pre("save", function (next) {
  const errorTime = new Date(this.errorTime);
  const jalaaliDate = jalaali.toJalaali(
    errorTime.getFullYear(),
    errorTime.getMonth() + 1,
    errorTime.getDate()
  );
  this.errorTime = `${jalaaliDate.jy}-${jalaaliDate.jm
    .toString()
    .padStart(2, "0")}-${jalaaliDate.jd.toString().padStart(2, "0")}`;
  next();
});

function validateTicket(ticket) {
  const schema = Joi.object({
    fullName: Joi.string().max(20).required(),
    email: Joi.string().email().max(100).required(),
    company: Joi.string().max(50).required(),
    licenseCode: Joi.string().max(255).required(),
    problemType: Joi.string().max(30).required(),
    errorTime: Joi.string().max(255).required(),
    request: Joi.string().max(255).required(),
    requestTitle: Joi.string().max(255).required(),
    attachmentFiles: Joi.array().items(Joi.string().max(500)), // Array of strings for image URLs
    assignedTo: Joi.string().optional(), // Validate as an optional string (ObjectId as string)
    createdBy: Joi.string().optional(),
  });
  const result = schema.validate(ticket);
  return result;
}

exports.Ticket = Ticket;
exports.validate = validateTicket;
exports.upload = upload; // Export the Multer upload middleware
