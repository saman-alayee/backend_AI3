const express = require("express");
const indexRouter = require("../routes/index");
const demoAuth = require("../routes/auth");
const demoAuthAdmin = require("../routes/authAdmin");
const demoUser = require("../routes/user");
const demoAdmin = require("../routes/admin");
const demoTicket = require("../routes/tickets");
const demoMail = require("../routes/forgetPassword");
const demoChat = require("../routes/chat")
const demoMom = require("../routes/mom")

const swagger = require('../swagger');

module.exports = function (app) {
  app.use(express.json());
  app.use("/api", indexRouter);
  app.use("/api/auth", demoAuth);
  app.use("/api/authAdmin", demoAuthAdmin);
  app.use("/api/users", demoUser);
  app.use("/api/admin", demoAdmin);
  app.use("/api/tickets", demoTicket);
  app.use("/api/forgetPassword", demoMail);
  app.use("/api/chat", demoChat);
  app.use("/api/mom", demoMom);

  app.use('/api-docs', swagger.serveSwaggerUI, swagger.setupSwaggerUI);
};
