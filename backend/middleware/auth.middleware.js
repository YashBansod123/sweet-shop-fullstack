// backend/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your-super-secret-key-that-is-long-and-random'; // Make sure this is the same secret as in your auth routes

module.exports = function(req, res, next) {
  // Get token from header
  const token = req.header('Authorization')?.replace('Bearer ', '');

  // Check if not token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};