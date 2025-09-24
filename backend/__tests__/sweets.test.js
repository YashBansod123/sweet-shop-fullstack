const request = require('supertest');
const { app, server } = require('../index');

afterAll((done) => {
  server.close(done);
});

describe('Sweets API', () => {
  let token;

  // Before running tests, register and login a user to get a token
  beforeAll(async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'sweetsuser@example.com', password: 'password123' });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'sweetsuser@example.com', password: 'password123' });

    token = res.body.token;
  });

  it('should not allow an unauthenticated user to add a sweet', async () => {
    const res = await request(app)
      .post('/api/sweets')
      .send({ name: 'Jalebi', category: 'Classic', price: 2.50, quantity: 100 });

    expect(res.statusCode).toEqual(401);
  });

  it('should allow an authenticated user to add a new sweet', async () => {
    const res = await request(app)
      .post('/api/sweets')
      .set('Authorization', `Bearer ${token}`) // Set the auth header
      .send({ name: 'Jalebi', category: 'Classic', price: 2.50, quantity: 100 });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('Jalebi');
  });
});