// backend/routes/sweets.routes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const adminMiddleware = require('../middleware/admin.middleware');
const db = require('../db');

// POST /api/sweets
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, category, price, quantity } = req.body;
    if (!name || !price || !quantity) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const sql = `INSERT INTO sweets (name, category, price, quantity) VALUES ($1, $2, $3, $4) RETURNING *`;
    const result = await db.query(sql, [name, category, price, quantity]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error while creating sweet' });
  }
});

// GET /api/sweets
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM sweets ORDER BY id');
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error while fetching sweets' });
  }
});

// GET /api/sweets/search
router.get('/search', authMiddleware, async (req, res) => {
  try {
    const { name } = req.query;
    const sql = `SELECT * FROM sweets WHERE name ILIKE $1`; // ILIKE is case-insensitive
    const result = await db.query(sql, [`%${name}%`]);
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error while searching' });
  }
});

// GET /api/sweets/:id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM sweets WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Sweet not found' });
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error while fetching sweet' });
  }
});

// POST /api/sweets/:id/purchase
router.post('/:id/purchase', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity: quantityToPurchase } = req.body;

    const sweetResult = await db.query('SELECT * FROM sweets WHERE id = $1', [id]);
    if (sweetResult.rows.length === 0) return res.status(404).json({ error: 'Sweet not found' });
    
    const sweet = sweetResult.rows[0];
    if (sweet.quantity < quantityToPurchase) {
      return res.status(400).json({ error: 'Not enough stock' });
    }

    const newQuantity = sweet.quantity - quantityToPurchase;
    const updateSql = `UPDATE sweets SET quantity = $1 WHERE id = $2 RETURNING *`;
    const updatedResult = await db.query(updateSql, [newQuantity, id]);
    res.status(200).json(updatedResult.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error during purchase' });
  }
});

// POST /api/sweets/:id/restock
router.post('/:id/restock', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity: quantityToAdd } = req.body;

    const sweetResult = await db.query('SELECT * FROM sweets WHERE id = $1', [id]);
    if (sweetResult.rows.length === 0) return res.status(404).json({ error: 'Sweet not found' });

    const sweet = sweetResult.rows[0];
    const newQuantity = sweet.quantity + quantityToAdd;
    const updateSql = `UPDATE sweets SET quantity = $1 WHERE id = $2 RETURNING *`;
    const updatedResult = await db.query(updateSql, [newQuantity, id]);
    res.status(200).json(updatedResult.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error during restock' });
  }
});

// PUT /api/sweets/:id
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { price, quantity } = req.body;
    const { id } = req.params;
    const sql = `UPDATE sweets SET price = $1, quantity = $2 WHERE id = $3 RETURNING *`;
    const result = await db.query(sql, [price, quantity, id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Sweet not found' });
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error while updating' });
  }
});

// DELETE /api/sweets/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM sweets WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Sweet not found' });
    }
    res.status(200).json({ message: 'Sweet deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error while deleting' });
  }
});

module.exports = router;