const jwt = require('jsonwebtoken');
const config = require('config');

function authAdmin(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).send('Access denied. No token provided.');

  try {
    const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
    if (!decoded.isAdmin) return res.status(403).send('Access denied.');
    req.adminId = decoded._id;
    next();
  } catch (ex) {
    res.status(400).send('Invalid token');
  }
}

module.exports = authAdmin;
