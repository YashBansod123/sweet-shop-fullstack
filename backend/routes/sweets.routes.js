// backend/routes/sweets.routes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const adminMiddleware = require('../middleware/admin.middleware');
const sqlite3 = require('sqlite3');

const db = new sqlite3.Database('./sweets.db');

// POST /api/sweets
router.post('/', authMiddleware, (req, res) => {
  const { name, category, price, quantity } = req.body;
  if (!name || !price || !quantity) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  db.serialize(() => {
    const sql = `INSERT INTO sweets (name, category, price, quantity) VALUES (?, ?, ?, ?)`;
    db.run(sql, [name, category, price, quantity], function(err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.status(201).json({ id: this.lastID, name, category, price, quantity });
    });
  });
});

// GET /api/sweets
router.get('/', authMiddleware, (req, res) => {
  db.serialize(() => {
    const sql = `SELECT * FROM sweets`;
    db.all(sql, [], (err, rows) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.status(200).json(rows);
    });
  });
});

// GET /api/sweets/search
router.get('/search', authMiddleware, (req, res) => {
  const { name } = req.query;
  db.serialize(() => {
    const sql = `SELECT * FROM sweets WHERE name LIKE ?`;
    const params = [`%${name}%`];
    db.all(sql, params, (err, rows) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.status(200).json(rows);
    });
  });
});

// POST /api/sweets/:id/purchase
router.post('/:id/purchase', authMiddleware, (req, res) => {
    const { id } = req.params;
    const { quantity: quantityToPurchase } = req.body;
    db.serialize(() => {
        db.get('SELECT * FROM sweets WHERE id = ?', [id], (err, sweet) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            if (!sweet) return res.status(404).json({ error: 'Sweet not found' });
            if (sweet.quantity < quantityToPurchase) {
                return res.status(400).json({ error: 'Not enough stock' });
            }
            const newQuantity = sweet.quantity - quantityToPurchase;
            const sql = `UPDATE sweets SET quantity = ? WHERE id = ?`;
            db.run(sql, [newQuantity, id], function(err) {
                if (err) return res.status(500).json({ error: 'Database error' });
                res.status(200).json({ ...sweet, quantity: newQuantity });
            });
        });
    });
});

// POST /api/sweets/:id/restock
router.post('/:id/restock', [authMiddleware, adminMiddleware], (req, res) => {
    const { id } = req.params;
    const { quantity: quantityToAdd } = req.body;
    db.serialize(() => {
        db.get('SELECT * FROM sweets WHERE id = ?', [id], (err, sweet) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            if (!sweet) return res.status(404).json({ error: 'Sweet not found' });
            const newQuantity = sweet.quantity + quantityToAdd;
            const sql = `UPDATE sweets SET quantity = ? WHERE id = ?`;
            db.run(sql, [newQuantity, id], function(err) {
                if (err) return res.status(500).json({ error: 'Database error' });
                res.status(200).json({ ...sweet, quantity: newQuantity });
            });
        });
    });
});

// PUT /api/sweets/:id
router.put('/:id', authMiddleware, (req, res) => {
    const { price, quantity } = req.body;
    const { id } = req.params;
    db.serialize(() => {
        const sql = `UPDATE sweets SET price = ?, quantity = ? WHERE id = ?`;
        db.run(sql, [price, quantity, id], function(err) {
            if (err) return res.status(500).json({ error: 'Database error' });
            db.get('SELECT * FROM sweets WHERE id = ?', [id], (err, row) => {
                if (err) return res.status(500).json({ error: 'Database error' });
                res.status(200).json(row);
            });
        });
    });
});

// DELETE /api/sweets/:id
router.delete('/:id', authMiddleware, (req, res) => {
    const { id } = req.params;
    db.serialize(() => {
        const sql = `DELETE FROM sweets WHERE id = ?`;
        db.run(sql, id, function(err) {
            if (err) return res.status(500).json({ error: 'Database error' });
            if (this.changes === 0) {
                return res.status(404).json({ message: 'Sweet not found' });
            }
            res.status(200).json({ message: 'Sweet deleted successfully' });
        });
    });
});

// GET /api/sweets/:id - Get a single sweet by ID
router.get('/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM sweets WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!row) return res.status(404).json({ error: 'Sweet not found' });
    res.status(200).json(row);
  });
});

module.exports = router;