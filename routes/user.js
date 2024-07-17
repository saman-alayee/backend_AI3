const express = require('express');
const router = express.Router();
const { User, validateUser } = require('../models/user');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const auth = require('../middleware/auth');

router.get('/verify', auth, async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.send(user);
});

router.post('/', async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) return res.status(400).send(error);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send('User is already registered.');

  user = new User(_.pick(req.body, ['email', 'password']));
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  await user.save();
  const token = user.generateAuthToken();
  res.header('x-auth-token', token).send(_.pick(user, ['_id', 'email']));
});

router.get('/', async (req, res) => {
  try {
    const users = await User.find().sort('email');
    res.send(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.put('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send('User not found.');

    if (req.body.email) user.email = req.body.email;
    await user.save();
    res.send(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).send('User not found.');
    res.send(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndRemove(req.params.id);
    if (!user) return res.status(404).send('User not found.');
    res.send('User deleted successfully.');
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
