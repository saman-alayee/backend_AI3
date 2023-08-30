var express = require("express");
var indexRouter = require("../routes/index");
var demoRequest = require("../routes/request");
var demoAuth = require("../routes/auth");
var demoUser = require("../routes/user");


module.exports = function (app) {
  app.use(express.json());
  app.use("/api", indexRouter);
  app.use("/api/request", demoRequest);
  app.use("/api/auth", demoAuth);
  app.use("/api/users", demoUser);
};
