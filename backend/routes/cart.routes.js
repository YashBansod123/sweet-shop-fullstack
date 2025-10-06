// backend/routes/cart.routes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const db = require('../db');

// GET /api/cart - Get or create a user's cart
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    let cartResult = await db.query('SELECT * FROM carts WHERE user_id = $1', [userId]);
    let cart = cartResult.rows[0];
    if (!cart) {
      cartResult = await db.query('INSERT INTO carts (user_id) VALUES ($1) RETURNING *', [userId]);
      cart = cartResult.rows[0];
    }
    res.status(200).json(cart);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- Add this new Route ---
// POST /api/cart/items - Add an item to the cart
router.post('/items', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { sweetId, quantity } = req.body;

    // 1. Get the user's cart
    const cartResult = await db.query('SELECT id FROM carts WHERE user_id = $1', [userId]);
    const cart = cartResult.rows[0];
    if (!cart) {
      // This should ideally not happen if the GET /cart logic is sound, but it's good practice
      return res.status(404).json({ error: 'Cart not found for this user.' });
    }

    // 2. Check if the item is already in the cart
    const existingItemResult = await db.query(
      'SELECT * FROM cart_items WHERE cart_id = $1 AND sweet_id = $2',
      [cart.id, sweetId]
    );
    const existingItem = existingItemResult.rows[0];

    let newItem;
    if (existingItem) {
      // 3a. If it exists, UPDATE the quantity
      const newQuantity = existingItem.quantity + quantity;
      const updateResult = await db.query(
        'UPDATE cart_items SET quantity = $1 WHERE id = $2 RETURNING *',
        [newQuantity, existingItem.id]
      );
      newItem = updateResult.rows[0];
    } else {
      // 3b. If it does not exist, INSERT a new row
      const insertResult = await db.query(
        'INSERT INTO cart_items (cart_id, sweet_id, quantity) VALUES ($1, $2, $3) RETURNING *',
        [cart.id, sweetId, quantity]
      );
      newItem = insertResult.rows[0];
    }
    
    res.status(201).json(newItem);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
// PUT /api/cart/items/:itemId - Update an item's quantity
router.put('/items/:itemId', authMiddleware, async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    const userId = req.user.id;

    // Security check: Ensure the item belongs to the user's cart
    const itemResult = await db.query(
      `SELECT ci.* FROM cart_items ci JOIN carts c ON ci.cart_id = c.id WHERE ci.id = $1 AND c.user_id = $2`,
      [itemId, userId]
    );

    if (itemResult.rows.length === 0) {
      return res.status(404).json({ error: 'Cart item not found or you do not have permission to edit it.' });
    }

    // Update the quantity
    const updateResult = await db.query(
      'UPDATE cart_items SET quantity = $1 WHERE id = $2 RETURNING *',
      [quantity, itemId]
    );

    res.status(200).json(updateResult.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;