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
  app.use("/", indexRouter);
  app.use("/auth", demoAuth);
  app.use("/authAdmin", demoAuthAdmin);
  app.use("/users", demoUser);
  app.use("/admin", demoAdmin);
  app.use("/tickets", demoTicket);
  app.use("/forgetPassword", demoMail);
  app.use("/chat", demoChat);
  app.use("/mom", demoMom);

  app.use('-docs', swagger.serveSwaggerUI, swagger.setupSwaggerUI);
};
