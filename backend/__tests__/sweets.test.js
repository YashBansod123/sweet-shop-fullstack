const request = require('supertest');
const { app, server } = require('../index');
const sqlite3 = require('sqlite3');

afterAll((done) => {
  server.close(done);
});

describe('Sweets API', () => {
  let token;

  beforeAll(async () => {
    // Register and login a user to get a token for protected routes
    await request(app).post('/api/auth/register').send({ email: 'sweetsuser@example.com', password: 'password123' });
    const res = await request(app).post('/api/auth/login').send({ email: 'sweetsuser@example.com', password: 'password123' });
    token = res.body.token;
  });

  // Clean the sweets table before each test
  beforeEach((done) => {
    const db = new sqlite3.Database('./sweets.db');
    db.run('DELETE FROM sweets', () => db.close(done));
  });

  it('should not allow an unauthenticated user to add a sweet', async () => {
    const res = await request(app).post('/api/sweets').send({ name: 'Jalebi', category: 'Classic', price: 2.50, quantity: 100 });
    expect(res.statusCode).toEqual(401);
  });

  it('should allow an authenticated user to add a new sweet', async () => {
    const res = await request(app)
      .post('/api/sweets')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Jalebi', category: 'Classic', price: 2.50, quantity: 100 });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('Jalebi');
  });

  // --- Add this new test ---
  it('should save the sweet to the database', async () => {
    const newSweet = { name: 'Gulab Jamun', category: 'Syrup-based', price: 3.00, quantity: 50 };

    await request(app)
      .post('/api/sweets')
      .set('Authorization', `Bearer ${token}`)
      .send(newSweet);

    // Verify by connecting directly to the database
    const db = new sqlite3.Database('./sweets.db');
    const sweetFromDb = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM sweets WHERE name = ?', [newSweet.name], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });
    db.close();

    expect(sweetFromDb).toBeDefined();
    expect(sweetFromDb.name).toBe(newSweet.name);
    expect(sweetFromDb.quantity).toBe(newSweet.quantity);
  });
  // Add this new 'it' block inside your describe block

it('should return a list of all sweets for an authenticated user', async () => {
  // First, create a couple of sweets to ensure the database isn't empty
  await request(app)
    .post('/api/sweets')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Jalebi', category: 'Classic', price: 2.50, quantity: 100 });

  await request(app)
    .post('/api/sweets')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Rasgulla', category: 'Syrup-based', price: 3.00, quantity: 50 });

  // Now, try to get the list
  const res = await request(app)
    .get('/api/sweets')
    .set('Authorization', `Bearer ${token}`);

  expect(res.statusCode).toEqual(200);
  expect(Array.isArray(res.body)).toBe(true);
  expect(res.body.length).toBe(2);
  expect(res.body[0].name).toBe('Jalebi');
});
});