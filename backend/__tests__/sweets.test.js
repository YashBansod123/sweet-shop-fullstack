const request = require('supertest');
const { app, server } = require('../index');
const db = require('../db'); // Use our PostgreSQL connection pool

let token;

beforeAll(async () => {
  await db.query('DELETE FROM users');
  await request(app).post('/api/auth/register').send({ email: 'sweetsuser@example.com', password: 'password123' });
  const res = await request(app).post('/api/auth/login').send({ email: 'sweetsuser@example.com', password: 'password123' });
  token = res.body.token;
});

afterAll((done) => {
  server.close(() => {
    db.pool.end(done);
  });
});

describe('Sweets API', () => {
  beforeEach(async () => {
    await db.query('DELETE FROM sweets');
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
  });

  it('should save the sweet to the database', async () => {
    const newSweet = { name: 'Gulab Jamun', category: 'Syrup-based', price: 3.00, quantity: 50 };
    await request(app)
      .post('/api/sweets')
      .set('Authorization', `Bearer ${token}`)
      .send(newSweet);
    const result = await db.query('SELECT * FROM sweets WHERE name = $1', [newSweet.name]);
    expect(result.rows[0]).toBeDefined();
    expect(result.rows[0].name).toBe(newSweet.name);
  });

  it('should return a list of all sweets', async () => {
    await request(app).post('/api/sweets').set('Authorization', `Bearer ${token}`).send({ name: 'Jalebi', category: 'Classic', price: 2.50, quantity: 100 });
    await request(app).post('/api/sweets').set('Authorization', `Bearer ${token}`).send({ name: 'Rasgulla', category: 'Syrup-based', price: 3.00, quantity: 50 });
    const res = await request(app).get('/api/sweets').set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBe(2);
  });

  it('should search for sweets by name', async () => {
    await request(app).post('/api/sweets').set('Authorization', `Bearer ${token}`).send({ name: 'Jalebi', category: 'Classic', price: 2.50, quantity: 100 });
    await request(app).post('/api/sweets').set('Authorization', `Bearer ${token}`).send({ name: 'Gulab Jamun', category: 'Syrup-based', price: 3.00, quantity: 50 });
    const res = await request(app).get('/api/sweets/search?name=Gulab').set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toBe('Gulab Jamun');
  });
  
  it('should return a single sweet by its ID', async () => {
    const postRes = await request(app).post('/api/sweets').set('Authorization', `Bearer ${token}`).send({ name: 'Test Sweet', category: 'Testing', price: 1.00, quantity: 10 });
    const sweetId = postRes.body.id;
    const getRes = await request(app).get(`/api/sweets/${sweetId}`).set('Authorization', `Bearer ${token}`);
    expect(getRes.statusCode).toEqual(200);
    expect(getRes.body.id).toBe(sweetId);
  });

  it('should update an existing sweet', async () => {
    const postRes = await request(app).post('/api/sweets').set('Authorization', `Bearer ${token}`).send({ name: 'Kaju Katli', category: 'Classic', price: 5.00, quantity: 30 });
    const sweetId = postRes.body.id;
    const updatedData = { price: 5.50, quantity: 25 };
    const res = await request(app).put(`/api/sweets/${sweetId}`).set('Authorization', `Bearer ${token}`).send(updatedData);
    expect(res.statusCode).toEqual(200);
    expect(res.body.price).toBe('5.50'); // Note: DECIMAL types are returned as strings from pg
  });

  it('should delete an existing sweet', async () => {
    const postRes = await request(app).post('/api/sweets').set('Authorization', `Bearer ${token}`).send({ name: 'Barfi', category: 'Milk-based', price: 4.00, quantity: 40 });
    const sweetId = postRes.body.id;
    const res = await request(app).delete(`/api/sweets/${sweetId}`).set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    const result = await db.query('SELECT * FROM sweets WHERE id = $1', [sweetId]);
    expect(result.rows.length).toBe(0);
  });
});