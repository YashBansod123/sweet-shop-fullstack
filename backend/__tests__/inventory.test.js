// backend/__tests__/inventory.test.js
const request = require('supertest');
const { app, server } = require('../index');
const sqlite3 = require('sqlite3');

afterAll((done) => {
  server.close(done);
});

describe('Inventory API', () => {
  let token;

  // Setup: Create a user and clean the DB before tests
  beforeAll(async () => {
    const db = new sqlite3.Database('./sweets.db');
    // Clear previous test users to avoid conflicts
    await new Promise((resolve) => db.run('DELETE FROM users', () => db.close(resolve)));

    await request(app).post('/api/auth/register').send({ email: 'inventory@example.com', password: 'password123' });
    const res = await request(app).post('/api/auth/login').send({ email: 'inventory@example.com', password: 'password123' });
    token = res.body.token;
  });

  // Clean the sweets table before each inventory test
  beforeEach((done) => {
    const db = new sqlite3.Database('./sweets.db');
    db.run('DELETE FROM sweets', () => db.close(done));
  });

  it('should decrease the quantity of a sweet upon purchase', async () => {
    // Step 1: Create a sweet with a starting quantity
    const postRes = await request(app)
      .post('/api/sweets')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Ladoo', category: 'Classic', price: 1.50, quantity: 20 });

    const sweetId = postRes.body.id;

    // Step 2: Send a request to purchase 5 of them
    const purchaseRes = await request(app)
      .post(`/api/sweets/${sweetId}/purchase`)
      .set('Authorization', `Bearer ${token}`)
      .send({ quantity: 5 });

    // Assertions
    expect(purchaseRes.statusCode).toEqual(200);
    expect(purchaseRes.body.quantity).toBe(15); // 20 - 5 = 15

    // Verify directly in the database
    const db = new sqlite3.Database('./sweets.db');
    const sweetFromDb = await new Promise((resolve) => {
        db.get('SELECT quantity FROM sweets WHERE id = ?', [sweetId], (_, row) => resolve(row));
    });
    db.close();
    expect(sweetFromDb.quantity).toBe(15);
  });
});