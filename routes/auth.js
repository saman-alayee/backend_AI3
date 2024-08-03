const express = require("express");
const router = express.Router();
const { User } = require("../models/user");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const config = require("config");

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

/**
 * @swagger
 * /auth:
 *   post:
 *     summary: Authenticate a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 description: User email
 *               password:
 *                 type: string
 *                 description: User password
 *     responses:
 *       200:
 *         description: Authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 role:
 *                   type: string
 *                 token:
 *                   type: string
 *                 username:
 *                   type: string
 *                 id:
 *                   type: string
 *                 email:
 *                   type: string
 *       400:
 *         description: Invalid email or password
 */
router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("شما قبلا ثبت نام نکرده اید.");

  const validatePassword = await bcrypt.compare(req.body.password, user.password);
  if (!validatePassword) return res.status(400).send("رمز عبور شما درست نمی باشد.");

  const accessToken = jwt.sign({_id:user._id,isUser:true},
    config.get("jwtPrivateKey")
  )
  res.json({
    status: "success",
    role: "user",
    token: accessToken,
    username: user.name,
    id: user._id,
    email: user.email,
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
