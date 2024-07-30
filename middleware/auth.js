const jwt = require("jsonwebtoken");
const config = require("config");

function auth(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).send("Access denied. No token provided.");

  try {
    const decoded = jwt.verify(token, config.get("jwtPrivateKey"));
    if (!decoded.isUser) return res.status(403).send('Access denied.');
    req.userId = decoded._id;
    next();
  } catch (ex) {
    res.status(400).send("Invalid token");
    console.log( jwt.verify(token, config.get("jwtPrivateKey")))
  }
}

module.exports = auth;
