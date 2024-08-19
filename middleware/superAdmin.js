const jwt = require('jsonwebtoken');
const config = require('config');

function superAdmin(req, res, next) {
  const token = req.headers['authorization'];

  const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
    if (decoded.role !== 'superadmin') {
      return res.status(403).send("Access denied. Requires Super Admin privileges.");
    }
    next();
  }
  
  module.exports = superAdmin;
  