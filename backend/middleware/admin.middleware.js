// backend/middleware/admin.middleware.js

module.exports = function(req, res, next) {
  // This middleware runs AFTER the authMiddleware, so req.user will exist.
  if (req.user && req.user.role === 'admin') {
    // If the user has the 'admin' role, proceed to the next function
    next();
  } else {
    // Otherwise, send a 403 Forbidden error
    res.status(403).json({ msg: 'Forbidden: Admin access required' });
  }
};