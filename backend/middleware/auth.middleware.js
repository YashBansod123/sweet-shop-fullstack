const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = function(req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  // --- ADDING DEBUGGING LOGS HERE ---
  console.log('--- AUTH MIDDLEWARE ---');
  console.log('Received Token:', token);
  console.log('Secret Key Being Used:', JWT_SECRET);
  // ------------------------------------

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.user;
    console.log('Token VERIFIED successfully. User:', req.user);
    next();
  } catch (err) {
    console.error('TOKEN VERIFICATION FAILED:', err.message); // Log the actual error
    res.status(401).json({ msg: 'Token is not valid' });
  }
};