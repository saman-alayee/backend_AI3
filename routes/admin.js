const express = require('express');
const router = express.Router();
const { Admin, validateAdmin } = require('../models/admin');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const auth = require('../middleware/auth');

router.get('/verify', auth, async (req, res) => {
  const admin = await Admin.findById(req.user._id).select('-password');
  res.send(admin);
});

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

router.get('/', async (req, res) => {
  try {
    const admins = await Admin.find().sort('email');
    res.send(admins);
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
