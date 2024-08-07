function superAdmin(req, res, next) {
    console.log(req)
    if (req.adminRole !== 'superadmin') {
      return res.status(403).send("Access denied. Requires Super Admin privileges.");
    }
    next();
  }
  
  module.exports = superAdmin;
  