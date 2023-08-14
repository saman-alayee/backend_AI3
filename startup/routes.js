var express = require("express");
var indexRouter = require("../routes/index");
var demoRouter = require("../routes/request");

module.exports = function (app) {
  app.use(express.json());
  app.use("/", indexRouter);
  app.use("/request", demoRouter);
};
