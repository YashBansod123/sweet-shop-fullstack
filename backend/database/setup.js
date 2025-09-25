// backend/database/setup.js
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

  try {
    console.log('Creating tables...');
    await query(createUsersTableQuery);
    await query(createSweetsTableQuery);
    console.log('Tables created successfully or already exist.');
  } catch (err) {
    console.error('Error setting up database:', err);
  } finally {
    await pool.end();
    console.log('Database setup complete.');
  }
}

setupDatabase();