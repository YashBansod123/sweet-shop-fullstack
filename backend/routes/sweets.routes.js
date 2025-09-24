// backend/routes/sweets.routes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const sqlite3 = require('sqlite3');

// Connect to the database
const db = new sqlite3.Database('./sweets.db');

router.post('/', authMiddleware, (req, res) => {
  const { name, category, price, quantity } = req.body;

  // Basic validation
  if (!name || !price || !quantity) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const sql = `INSERT INTO sweets (name, category, price, quantity) VALUES (?, ?, ?, ?)`;

  db.run(sql, [name, category, price, quantity], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    // Respond with the newly created sweet object, including its new ID
    res.status(201).json({
      id: this.lastID,
      name,
      category,
      price,
      quantity
    });
  });
});

module.exports = router;