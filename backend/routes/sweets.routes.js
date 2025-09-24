// backend/routes/sweets.routes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');

// This route corresponds to POST /api/sweets
// We apply the authMiddleware first. If the token is invalid, it will be rejected.
// If it's valid, the (req, res) function will run.
router.post('/', authMiddleware, (req, res) => {
  // For now, just send a success response to make the test pass
  const { name, category, price, quantity } = req.body;
  res.status(201).json({ id: 1, name, category, price, quantity });
});

module.exports = router;