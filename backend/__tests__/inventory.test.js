const request = require('supertest');
const { app, server } = require('../index');
const sqlite3 = require('sqlite3');

describe('Inventory API', () => {
  let db;
  let regularUserToken;
  let adminToken;

  // Before ALL tests, open one DB connection and create users
  beforeAll((done) => {
    db = new sqlite3.Database('./sweets.db', async (err) => {
      if (err) return done(err);

      const dbRun = (sql, params = []) => new Promise((resolve, reject) => {
        db.run(sql, params, (err) => (err ? reject(err) : resolve()));
      });

      await dbRun('DELETE FROM users');

      // Create regular user and get token
      await request(app).post('/api/auth/register').send({ email: 'user@example.com', password: 'password123' });
      const userRes = await request(app).post('/api/auth/login').send({ email: 'user@example.com', password: 'password123' });
      regularUserToken = userRes.body.token;

      // Create admin user and get token
      await request(app).post('/api/auth/register').send({ email: 'admin@example.com', password: 'adminpass' });
      await dbRun("UPDATE users SET role = 'admin' WHERE email = ?", ['admin@example.com']);
      const adminRes = await request(app).post('/api/auth/login').send({ email: 'admin@example.com', password: 'adminpass' });
      adminToken = adminRes.body.token;

      done();
    });
  });

  // After ALL tests, close the server and the single DB connection
  afterAll((done) => {
    server.close(() => {
      db.close(done);
    });
  });

  // Before EACH test, clean the sweets table
  beforeEach((done) => {
    db.run('DELETE FROM sweets', done);
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