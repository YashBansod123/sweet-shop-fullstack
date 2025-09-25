const request = require('supertest');
const { app, server } = require('../index');
const db = require('../db'); // Use our new PostgreSQL connection pool

afterAll((done) => {
  server.close(() => {
    db.pool.end(done); // Close the PostgreSQL pool
  });
});

describe('Auth Endpoints', () => {
  // Before each test, wipe the users table
  beforeEach(async () => {
    await db.query('DELETE FROM users');
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

    // Verify by querying the PostgreSQL database
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

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