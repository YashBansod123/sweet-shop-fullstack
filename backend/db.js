// backend/db.js
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'sweet_shop',
  password: 'Yashba598@123', // <-- IMPORTANT: Put your PostgreSQL password here
  port: 5432,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool: pool, 
};