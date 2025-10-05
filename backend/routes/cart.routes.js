// backend/routes/cart.routes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const db = require('../db');

// GET /api/cart - Get or create a user's cart
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Try to find an existing cart for the user
    let cartResult = await db.query('SELECT * FROM carts WHERE user_id = $1', [userId]);
    let cart = cartResult.rows[0];

    // If no cart exists, create one
    if (!cart) {
      cartResult = await db.query('INSERT INTO carts (user_id) VALUES ($1) RETURNING *', [userId]);
      cart = cartResult.rows[0];
    }

    // For now, just return the cart. Later we'll add the items.
    res.status(200).json(cart);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;