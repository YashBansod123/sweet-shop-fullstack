const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;
const authRoutes = require('./routes/auth.routes'); // Import the router
const sweetsRoutes = require('./routes/sweets.routes'); // 1. Import sweets routes

app.use(cors());

app.use(express.json());

// Use the auth routes for any path starting with /api/auth
app.use('/api/auth', authRoutes);
app.use('/api/sweets', sweetsRoutes); // 2. Use sweets routes

const server = app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

module.exports = { app, server };