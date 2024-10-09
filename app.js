const express = require('express');
const morgan = require('morgan');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const config = require('config');
const swagger = require('./swagger');
const createError = require('http-errors');
const chalk = require('chalk'); // Import chalk

const app = express();

// Middleware setup
app.use(cors());

// Custom logger format to include date and time
morgan.token('date', function () {
  return new Date().toISOString();
});

// Custom token for colored status
morgan.token('status', (req, res) => {
  const statusCode = res.statusCode;
  let color;

  if (statusCode >= 200 && statusCode < 300) {
    color = chalk.green; // 2xx success
  } else if (statusCode >= 300 && statusCode < 400) {
    color = chalk.yellow; // 3xx redirection
  } else if (statusCode >= 400 && statusCode < 500) {
    color = chalk.red; // 4xx client error
  } else {
    color = chalk.magenta; // 5xx server error
  }

  return color(statusCode); // Return the colored status code
});

// Use the custom format for morgan
app.use(morgan(':method :url :status :response-time ms :date'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve Swagger UI
app.use('/api-docs', swagger.serveSwaggerUI, swagger.setupSwaggerUI);

// Route and database setup
require('./startup/routes')(app);
require('./startup/db')();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Define base URL
const baseUrl = config.get("baseUrl");

// Middleware to log client IP
app.use((req, res, next) => {
  const clientIP = req.ip;
  console.log(`Request from IP: ${clientIP}`);
  next();
});

// Middleware to prepend base URL to image paths
app.use((req, res, next) => {
  res.locals.baseUrl = baseUrl;
  next();
});

// Handle undefined routes (404)
app.use((req, res, next) => {
  res.status(404).json({ message: "Endpoint not found" });
});

// Error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
