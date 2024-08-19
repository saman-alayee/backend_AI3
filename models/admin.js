const mongoose = require("mongoose");
const Joi = require("joi");
const config = require("config");
const jwt = require("jsonwebtoken");

const adminSchema = new mongoose.Schema(
  {
    fullname:{
      type:String,
      required:true,
      maxlength:124
    },
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
    role: {
      type: String,
      enum: ["admin", "superadmin"],
    },
  },
  { timestamps: true }
);

adminSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { _id: this._id,role:this.role },
    config.get("jwtPrivateKey"),
    { expiresIn: "12h" }
  );
  return token;
};

const Admin = mongoose.model("Admin", adminSchema);

function validateAdmin(admin) {
  const schema = Joi.object({
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(1024).required(),
    fullname:Joi.string().max(124).required()
  });
  return schema.validate(admin);
}

exports.Admin = Admin;
exports.validateAdmin = validateAdmin;
