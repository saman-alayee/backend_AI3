const winston = require('winston');
const mongoose = require('mongoose');
const config = require('config');

// Configure winston
winston.configure({
  level: 'info',
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'app.log' })
  ]
});

module.exports = function() {
  const mongoURI = config.get("mongo_URI");
  mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
    .then(() => winston.info('Connected to MongoDB...'))
    .catch((err) => winston.error('Error connecting to MongoDB:', err));
}
