const express = require('express');
const app = express();
const PORT = 3001;
const authRoutes = require('./routes/auth.routes'); // Import the router

app.use(express.json());

// Use the auth routes for any path starting with /api/auth
app.use('/api/auth', authRoutes);

const server = app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

module.exports = { app, server };