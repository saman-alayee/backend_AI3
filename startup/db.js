const winston = require('winston');
const mongoose = require('mongoose');
const config = require('config');

module.exports = function() {
  const mongoURI = config.get("mongo_URI");
  console.log(mongoURI);
  mongoose.connect("mongodb://127.0.0.1:27017/requests")
    .then(() => winston.info('Connected to MongoDB...'))
    .catch((err)=> console.log(err))
}