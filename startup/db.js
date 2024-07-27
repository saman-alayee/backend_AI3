const winston = require('winston');
const mongoose = require('mongoose');
const config = require('config');

module.exports = function() {
  const mongoURI = config.get("mongo_URI");
  mongoose.connect(mongoURI)
    .then(() => winston.info('Connected to MongoDB...'))
    .catch((err)=> console.log(err))
}