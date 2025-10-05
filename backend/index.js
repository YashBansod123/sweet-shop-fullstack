require('dotenv').config(); // MUST BE THE FIRST LINE

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;
const authRoutes = require('./routes/auth.routes');
const sweetsRoutes = require('./routes/sweets.routes');
const cartRoutes = require('./routes/cart.routes'); // 1. Import cart routes

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/sweets', sweetsRoutes);
app.use('/api/cart', cartRoutes); // 2. Use cart routes

const server = app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

module.exports = { app, server };