const request = require('supertest');
const { app, server } = require('../index');
const sqlite3 = require('sqlite3');

// This block runs after all tests are finished
afterAll((done) => {
  server.close(done); // Close the server to prevent hanging
});

describe('Auth Endpoints', () => {
  // This block runs BEFORE EACH test
  beforeEach((done) => {
    const db = new sqlite3.Database('./sweets.db');
    // Delete all users to ensure a clean slate for every test
    db.run('DELETE FROM users', () => {
      db.close(done);
    });
  });

  it('should register a new user successfully', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'password123' });

    expect(response.statusCode).toEqual(201);
    expect(response.body).toHaveProperty('message', 'User created successfully');
  });

  it('should save the user to the database with a hashed password', async () => {
    const email = 'testuser2@example.com';
    const password = 'password123';

    await request(app)
      .post('/api/auth/register')
      .send({ email, password });

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
    expect(user.password).not.toBe(password);
  });

  it('should log in an existing user and return a token', async () => {
    const email = 'login@example.com';
    const password = 'password123';

    await request(app)
      .post('/api/auth/register')
      .send({ email, password });

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email, password });

    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveProperty('token');
  });
});