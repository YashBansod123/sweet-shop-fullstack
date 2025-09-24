// backend/routes/sweets.routes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const sqlite3 = require('sqlite3');

const db = new sqlite3.Database('./sweets.db');

// POST /api/sweets - Add a new sweet
router.post('/', authMiddleware, (req, res) => {
  const { name, category, price, quantity } = req.body;

  if (!name || !price || !quantity) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const sql = `INSERT INTO sweets (name, category, price, quantity) VALUES (?, ?, ?, ?)`;

  db.run(sql, [name, category, price, quantity], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(201).json({
      id: this.lastID,
      name,
      category,
      price,
      quantity
    });
  });
});

// --- Add this new route ---
// GET /api/sweets - Get all sweets
router.get('/', authMiddleware, (req, res) => {
  const sql = `SELECT * FROM sweets`;

  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(200).json(rows);
  });
});
// -------------------------

module.exports = router;