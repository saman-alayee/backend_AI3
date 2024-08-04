const express = require('express');
const router = express.Router();
const { Admin, validateAdmin } = require('../models/admin');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const adminAuth = require('../middleware/adminAuth');

/**
 * @swagger
 * /admin/verify:
 *   get:
 *     summary: Verify admin
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns the authenticated admin without password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 email:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
router.get('/verify', adminAuth, async (req, res) => {
  console.log(req)
  const admin = await Admin.findById(req.adminId).select('-password');
  res.send(admin);
});

/**
 * @swagger
 * /admin:
 *   post:
 *     summary: Register a new admin
 *     tags: [Admin]
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
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Admin registered successfully
 *         headers:
 *           x-auth-token:
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 email:
 *                   type: string
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal Server Error
 */
router.post('/', async (req, res) => {
  const { error } = validateAdmin(req.body);
  if (error) return res.status(400).send(error);

  let admin = await Admin.findOne({ email: req.body.email });
  if (admin) return res.status(400).send('Admin is already registered.');

  admin = new Admin(_.pick(req.body, ['email', 'password']));
  const salt = await bcrypt.genSalt(10);
  admin.password = await bcrypt.hash(admin.password, salt);

  await admin.save();
  const token = admin.generateAuthToken();
  res.header('x-auth-token', token).send(_.pick(admin, ['_id', 'email']));
});

/**
 * @swagger
 * /admin:
 *   get:
 *     summary: Get all admins
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Returns a list of all admins
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   email:
 *                     type: string
 *       500:
 *         description: Internal Server Error
 */
router.get('/', async (req, res) => {
  try {
    const admins = await Admin.find().sort('email');
    res.send(admins);
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).send('Internal Server Error');
  }
});

/**
 * @swagger
 * /admin/{id}:
 *   put:
 *     summary: Update an admin's email
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Admin ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Admin updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 email:
 *                   type: string
 *       404:
 *         description: Admin not found
 *       500:
 *         description: Internal Server Error
 */
router.put('/:id', async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) return res.status(404).send('Admin not found.');

    if (req.body.email) admin.email = req.body.email;
    await admin.save();
    res.send(admin);
  } catch (error) {
    console.error('Error updating admin:', error);
    res.status(500).send('Internal Server Error');
  }
});

/**
 * @swagger
 * /admin/{id}:
 *   get:
 *     summary: Get an admin by ID
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Admin ID
 *     responses:
 *       200:
 *         description: Returns the admin without password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 email:
 *                   type: string
 *       404:
 *         description: Admin not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/:id', async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id).select('-password');
    if (!admin) return res.status(404).send('Admin not found.');
    res.send(admin);
  } catch (error) {
    console.error('Error fetching admin:', error);
    res.status(500).send('Internal Server Error');
  }
});

/**
 * @swagger
 * /admin/{id}:
 *   delete:
 *     summary: Delete an admin by ID
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Admin ID
 *     responses:
 *       200:
 *         description: Admin deleted successfully
 *       404:
 *         description: Admin not found
 *       500:
 *         description: Internal Server Error
 */
router.delete('/:id', async (req, res) => {
  try {
    const admin = await Admin.findByIdAndRemove(req.params.id);
    if (!admin) return res.status(404).send('Admin not found.');
    res.send('Admin deleted successfully.');
  } catch (error) {
    console.error('Error deleting admin:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
