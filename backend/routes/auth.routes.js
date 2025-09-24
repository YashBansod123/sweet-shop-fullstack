const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3');
const jwt = require('jsonwebtoken'); // Import JWT

// IMPORTANT: In a real app, this secret should be in a .env file!
const JWT_SECRET = 'your-super-secret-key-that-is-long-and-random';

const db = new sqlite3.Database('./sweets.db');

// User Registration
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = `INSERT INTO users (email, password) VALUES (?, ?)`;
    db.run(sql, [email, hashedPassword], function(err) {
      if (err) {
        return res.status(400).json({ error: 'Email may already be in use.' });
      }
      res.status(201).json({ message: 'User created successfully', userId: this.lastID });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// --- Add this new Login Route ---
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const sql = `SELECT * FROM users WHERE email = ?`;

  db.get(sql, [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Server error' });
    }
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Create JWT Payload
    const payload = { user: { id: user.id } };

    // Sign the token
    jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.status(200).json({ token });
    });
  });
});

module.exports = router;