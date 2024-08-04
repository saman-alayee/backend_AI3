const express = require("express");
const router = express.Router();
const { Admin } = require("../models/admin");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("config");

/**
 * @swagger
 * tags:
 *   name: AdminAuth
 *   description: Admin authentication endpoints
 */

/**
 * @swagger
 * /adminAuth:
 *   post:
 *     summary: Authenticate an admin
 *     tags: [AdminAuth]
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
 *                 description: Admin email
 *               password:
 *                 type: string
 *                 description: Admin password
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

  let admin = await Admin.findOne({ email: req.body.email });
  if (!admin) return res.status(400).send("ایمیل موحود نمی باشد . ");

  const validPassword = await bcrypt.compare(req.body.password, admin.password);
  if (!validPassword) return res.status(400).send("رمز عبور اشتباه می باشد.");

  const token = jwt.sign(
    { _id: admin._id, isAdmin: true },
    config.get("jwtPrivateKey")
  );
  res.json({
    status: "success",
    role: "admin",
    token: token,
    username: admin.name,
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
