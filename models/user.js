const mongoose = require('mongoose');
const Joi = require('joi');
const config = require('config');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
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
  fullname:{
    type:String,
    required:true,
    maxlength:124
  }
}, { timestamps: true });

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign({ _id: this._id, role: 'user' }, config.get('jwtPrivateKey'), { expiresIn: '12h' });
  return token;
};

const User = mongoose.model('User', userSchema);

function validateUser(user) {
  const schema = Joi.object({
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(1024).required(),
    fullname:Joi.string().max(124).required()
  });
  return schema.validate(user);
}

exports.User = User;
exports.validateUser = validateUser;
