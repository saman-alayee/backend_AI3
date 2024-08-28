const express = require('express');
const router = express.Router();
const { Admin, validateAdmin } = require('../models/admin');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const adminAuth = require('../middleware/adminAuth');
const superAdmin = require("../middleware/superAdmin");


router.get('/verify', adminAuth, async (req, res) => {
  const admin = await Admin.findById(req.adminId).select('-password');
  res.send(admin);
});

router.post('/', superAdmin, async (req, res) => {
  const { error } = validateAdmin(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let admin = await Admin.findOne({ email: req.body.email });
  if (admin) return res.status(400).send('Admin is already registered.');

  // Include the role when creating the new admin
  admin = new Admin({
    email: req.body.email,
    password: req.body.password,
    fullname: req.body.fullname,
    role: 'admin' 
  });

  const salt = await bcrypt.genSalt(10);
  admin.password = await bcrypt.hash(admin.password, salt);

  await admin.save();

  const token = admin.generateAuthToken();
  res.header('x-auth-token', token).send(_.pick(admin, ['_id', 'email', 'fullname']));
});


router.get('/', superAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; 
    const limit = parseInt(req.query.limit) || 10; 
    const skip = (page - 1) * limit;

    const admins = await Admin.find()
      .sort('email')
      .skip(skip)
      .limit(limit);

    const totalAdmins = await Admin.countDocuments();

    res.status(200).json({
      totalAdmins,
      totalPages: Math.ceil(totalAdmins / limit),
      currentPage: page,
      admins,
    });
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).send('Internal Server Error');
  }
});


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

router.delete('/:id',adminAuth, async (req, res) => {
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
