// backend/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db'); // Use our new PostgreSQL connection

const JWT_SECRET = process.env.JWT_SECRET;

// User Registration
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id`;
    const result = await db.query(sql, [email, hashedPassword]);

    res.status(201).json({ message: 'User created successfully', userId: result.rows[0].id });
  } catch (err) {
    if (err.code === '23505') { // Unique violation error code for PostgreSQL
      return res.status(400).json({ error: 'Email may already be in use.' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// User Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const sql = `SELECT * FROM users WHERE email = $1`;

    const result = await db.query(sql, [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const payload = { user: { id: user.id, role: user.role } };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;