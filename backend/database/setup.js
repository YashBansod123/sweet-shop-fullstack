// backend/database/setup.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./sweets.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the sweets database.');
});

db.serialize(() => {
  // Create Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT
  )`, (err) => {
    if (err) console.error(err.message);
    else console.log("Users table created or already exists.");
  });

  // Create Sweets table
  db.run(`CREATE TABLE IF NOT EXISTS sweets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT,
    price REAL NOT NULL,
    quantity INTEGER NOT NULL
  )`, (err) => {
    if (err) console.error(err.message);
    else console.log("Sweets table created or already exists.");
  });
});

db.close((err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Closed the database connection.');
});