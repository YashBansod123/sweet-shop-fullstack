require('dotenv').config(); // <-- THIS IS THE FIX

const { query, pool } = require('../db');

async function setupDatabase() {
  const createUsersTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role VARCHAR(50) DEFAULT 'user'
    );
  `;

  const createSweetsTableQuery = `
    CREATE TABLE IF NOT EXISTS sweets (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      category VARCHAR(100),
      price DECIMAL(10, 2) NOT NULL,
      quantity INTEGER NOT NULL
    );
  `;

  const createCartsTableQuery = `
    CREATE TABLE IF NOT EXISTS carts (
      id SERIAL PRIMARY KEY,
      user_id INTEGER UNIQUE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `;

  const createCartItemsTableQuery = `
    CREATE TABLE IF NOT EXISTS cart_items (
      id SERIAL PRIMARY KEY,
      cart_id INTEGER NOT NULL,
      sweet_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
      FOREIGN KEY (sweet_id) REFERENCES sweets(id) ON DELETE CASCADE
    );
  `;

  try {
    console.log('Creating tables...');
    await query(createUsersTableQuery);
    await query(createSweetsTableQuery);
    await query(createCartsTableQuery);
    await query(createCartItemsTableQuery);
    console.log('All tables created successfully or already exist.');
  } catch (err) {
    console.error('Error setting up database:', err);
  } finally {
    await pool.end();
    console.log('Database setup complete.');
  }
}

setupDatabase();