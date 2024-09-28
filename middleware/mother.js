const jwt = require('jsonwebtoken');
const config = require('config');

function superAdmin(req, res, next) {
  const token = req.headers['authorization'];

  const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
    if (decoded.role !== 'user') {
      return res.status(403).send("Access denied. Requires user mother privileges.");
    }
    next();
  }
  
  module.exports = superAdmin;
  