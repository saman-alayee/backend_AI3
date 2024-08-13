var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var nodemailer = require('nodemailer');
var cors = require('cors');
var config = require('config');
const ExcelJS = require('exceljs');
const swagger = require('./swagger');

var app = express();

// Middleware setup
app.use(cors());
app.use(logger('dev'));
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
const baseUrl = 'http://localhost:3000';

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

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
