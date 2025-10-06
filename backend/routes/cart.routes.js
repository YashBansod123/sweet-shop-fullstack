const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const db = require('../db');

// This function will be reused to ensure a user always has a cart
async function getOrCreateCart(userId) {
  let cartResult = await db.query('SELECT * FROM carts WHERE user_id = $1', [userId]);
  let cart = cartResult.rows[0];

  if (!cart) {
    cartResult = await db.query('INSERT INTO carts (user_id) VALUES ($1) RETURNING *', [userId]);
    cart = cartResult.rows[0];
  }
  return cart;
}

// GET /api/cart - Get or create a user's cart
// In backend/routes/cart.routes.js
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await getOrCreateCart(userId);

    // New Logic: Fetch all items in the cart and join with sweets table
    const itemsResult = await db.query(
      `SELECT ci.id, ci.quantity, s.name, s.price 
       FROM cart_items ci 
       JOIN sweets s ON ci.sweet_id = s.id 
       WHERE ci.cart_id = $1`,
      [cart.id]
    );

    // Attach the items to the cart object
    const response = {
      ...cart,
      items: itemsResult.rows
    };

    res.status(200).json(response);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// POST /api/cart/items - Add an item to the cart
router.post('/items', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { sweetId, quantity } = req.body;

    // 1. Get or create the user's cart
    const cart = await getOrCreateCart(userId);

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

// ... (your PUT and DELETE routes for cart items)

module.exports = router;