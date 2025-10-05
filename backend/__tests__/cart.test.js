const request = require('supertest');
const { app, server } = require('../index');
const db = require('../db');

let token;

beforeAll(async () => {
  // Create a user and log in to get a token
  await db.query('DELETE FROM users');
  await request(app).post('/api/auth/register').send({ email: 'cartuser@example.com', password: 'password123' });
  const res = await request(app).post('/api/auth/login').send({ email: 'cartuser@example.com', password: 'password123' });
  token = res.body.token;
});

afterAll((done) => {
  server.close(() => {
    db.pool.end(done);
  });
});

describe('Cart API', () => {
  it('should get the current user\'s cart', async () => {
    const res = await request(app)
      .get('/api/cart')
      .set('Authorization', `Bearer ${token}`);

    // For now, we expect it to fail, but eventually it will be 200
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id');
  });
});