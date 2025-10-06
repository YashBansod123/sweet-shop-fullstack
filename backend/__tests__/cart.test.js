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
  it('should add an item to the user\'s cart', async () => {
  // Setup: We need a sweet to add to the cart.
  // We'll create one directly in the database for this test.
  const sweetResult = await db.query(
    "INSERT INTO sweets (name, category, price, quantity) VALUES ('Test Ladoo', 'Test', 1.50, 50) RETURNING id"
  );
  const sweetId = sweetResult.rows[0].id;

  // Action: Send a request to add the sweet to the cart
  const res = await request(app)
    .post('/api/cart/items')
    .set('Authorization', `Bearer ${token}`)
    .send({
      sweetId: sweetId,
      quantity: 2
    });

  // Assertions
  expect(res.statusCode).toEqual(201); // 201 for "Created"
  expect(res.body.sweet_id).toBe(sweetId);
  expect(res.body.quantity).toBe(2);
});
it('should update the quantity of an item in the cart', async () => {
  // Setup Step 1: Create a sweet
  const sweetResult = await db.query(
    "INSERT INTO sweets (name, category, price, quantity) VALUES ('Test Kaju Katli', 'Test', 5.00, 50) RETURNING id"
  );
  const sweetId = sweetResult.rows[0].id;

  // Setup Step 2: Add the sweet to the cart to create a cart item
  const addRes = await request(app)
    .post('/api/cart/items')
    .set('Authorization', `Bearer ${token}`)
    .send({ sweetId: sweetId, quantity: 1 });

  const cartItemId = addRes.body.id;

  // Action: Send a PUT request to update the quantity to 5
  const updateRes = await request(app)
    .put(`/api/cart/items/${cartItemId}`)
    .set('Authorization', `Bearer ${token}`)
    .send({ quantity: 5 });

  // Assertions
  expect(updateRes.statusCode).toEqual(200);
  expect(updateRes.body.quantity).toBe(5);
});
});