const jwt = require("jsonwebtoken");
const config = require("config");

function auth(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).send("Access denied. No token provided.");

  try {
    const decoded = jwt.verify(token, config.get("jwtPrivateKey"));

    // Check if the user is not verified
    if (!decoded.isVerified) {
      return res.status(403).send("Access denied. Please verify your account.");
    }

    // Optional: Check if the user is not admin verified (if required)
    if (decoded.isAdminVerified === false) {
      return res.status(403).send("Access denied. Your account is awaiting admin verification.");
    }

    // Check if the user is not authorized (not a user role)
    if (!decoded.isUser) {
      return res.status(403).send("Access denied. User role required.");
    }
    
    // Attach the user ID to the request for future use
    req.userId = decoded._id;
    
    next();
  } catch (ex) {
    res.status(400).send("Invalid token");
  }
}

module.exports = auth;
