const request = require('supertest');
const { app, server } = require('../index');
const db = require('../db'); // Use our PostgreSQL connection

let regularUserToken;
let adminToken;

// Before all tests, set up our users and tokens
beforeAll(async () => {
  // Clean the database
  await db.query('DELETE FROM users');
  await db.query('DELETE FROM sweets');

  // Create a regular user and get their token
  await request(app).post('/api/auth/register').send({ email: 'user@example.com', password: 'password123' });
  const userRes = await request(app).post('/api/auth/login').send({ email: 'user@example.com', password: 'password123' });
  regularUserToken = userRes.body.token;

  // Create an admin user and get their token
  await request(app).post('/api/auth/register').send({ email: 'admin@example.com', password: 'adminpass' });
  await db.query("UPDATE users SET role = 'admin' WHERE email = $1", ['admin@example.com']);
  const adminRes = await request(app).post('/api/auth/login').send({ email: 'admin@example.com', password: 'adminpass' });
  adminToken = adminRes.body.token;
});

// After all tests are done, close the server and database connection
afterAll((done) => {
  server.close(() => {
    db.pool.end(done);
  });
});

describe('Inventory API', () => {
  // Before each individual test, make sure the sweets table is empty
  beforeEach(async () => {
    await db.query('DELETE FROM sweets');
  });

  it('should decrease the quantity of a sweet upon purchase', async () => {
    const postRes = await request(app).post('/api/sweets').set('Authorization', `Bearer ${regularUserToken}`).send({ name: 'Ladoo', price: 1.50, quantity: 20 });
    const sweetId = postRes.body.id;
    const purchaseRes = await request(app).post(`/api/sweets/${sweetId}/purchase`).set('Authorization', `Bearer ${regularUserToken}`).send({ quantity: 5 });
    expect(purchaseRes.statusCode).toEqual(200);
    expect(purchaseRes.body.quantity).toBe(15);
  });

  it('should allow an admin to restock a sweet', async () => {
    const postRes = await request(app).post('/api/sweets').set('Authorization', `Bearer ${adminToken}`).send({ name: 'Barfi', price: 4, quantity: 10 });
    const sweetId = postRes.body.id;
    const restockRes = await request(app).post(`/api/sweets/${sweetId}/restock`).set('Authorization', `Bearer ${adminToken}`).send({ quantity: 50 });
    expect(restockRes.statusCode).toEqual(200);
    expect(restockRes.body.quantity).toBe(60);
  });

  it('should NOT allow a regular user to restock a sweet', async () => {
    const postRes = await request(app).post('/api/sweets').set('Authorization', `Bearer ${regularUserToken}`).send({ name: 'Barfi', price: 4, quantity: 10 });
    const sweetId = postRes.body.id;
    const restockRes = await request(app).post(`/api/sweets/${sweetId}/restock`).set('Authorization', `Bearer ${regularUserToken}`).send({ quantity: 50 });
    expect(restockRes.statusCode).toEqual(403);
  });
});