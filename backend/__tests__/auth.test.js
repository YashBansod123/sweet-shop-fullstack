const request = require('supertest');
// Import both app and the server instance
const { app, server } = require('../index');

// This block will run after all tests are finished
afterAll((done) => {
  server.close(done); // Close the server to prevent hanging
});

describe('Auth Endpoints', () => {
  it('should register a new user successfully', async () => {
    const response = await request(app)
      .post('/api/auth/register') // This route doesn't exist yet
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    expect(response.statusCode).toEqual(201);
    expect(response.body).toHaveProperty('message', 'User created successfully');
  });
  
it('should save the user to the database with a hashed password', async () => {
  const email = 'testuser2@example.com';
  const password = 'password123';

  await request(app)
    .post('/api/auth/register')
    .send({ email, password });

  // Connect to the database to verify
  const sqlite3 = require('sqlite3');
  const db = new sqlite3.Database('./sweets.db');

  const user = await new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
      if (err) reject(err);
      resolve(row);
    });
  });
  db.close();

  expect(user).toBeDefined();
  expect(user.email).toBe(email);
  expect(user.password).not.toBe(password); // IMPORTANT: Check that the password is NOT plain text
});
});