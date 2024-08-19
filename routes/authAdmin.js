const express = require("express");
const router = express.Router();
const { Admin } = require("../models/admin");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("config");

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let admin = await Admin.findOne({ email: req.body.email });
  if (!admin) return res.status(400).send("ایمیل موحود نمی باشد . ");

  const validPassword = await bcrypt.compare(req.body.password, admin.password);
  if (!validPassword) return res.status(400).send("رمز عبور اشتباه می باشد.");
  const token = jwt.sign(
    { _id: admin._id, isAdmin: true, role:admin.role },
    config.get("jwtPrivateKey")
  );
  res.json({
    status: "success",
    role: admin.role,
    token: token,
    fullname: admin.fullname,
    id: admin._id,
    email: admin.email,
  });
});

function validate(req) {
  const schema = Joi.object({
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(1024).required(),
  });
  return schema.validate(req);
}

module.exports = router;
