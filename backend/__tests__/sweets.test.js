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
// Add this new 'it' block inside your describe block

it('should search for sweets by name', async () => {
  // Setup: Create some sweets to search through
  await request(app)
    .post('/api/sweets')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Jalebi', category: 'Classic', price: 2.50, quantity: 100 });

  await request(app)
    .post('/api/sweets')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Gulab Jamun', category: 'Syrup-based', price: 3.00, quantity: 50 });

  // Action: Search for a sweet
  const res = await request(app)
    .get('/api/sweets/search?name=Gulab') // Use query parameter for search
    .set('Authorization', `Bearer ${token}`);

  // Assertions
  expect(res.statusCode).toEqual(200);
  expect(res.body.length).toBe(1);
  expect(res.body[0].name).toBe('Gulab Jamun');
});
// Add this new 'it' block inside your describe block

it('should update an existing sweet', async () => {
  // Setup: First, create a sweet to get its ID
  const postRes = await request(app)
    .post('/api/sweets')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Kaju Katli', category: 'Classic', price: 5.00, quantity: 30 });

  const sweetId = postRes.body.id;
  const updatedData = { price: 5.50, quantity: 25 };

  // Action: Send a PUT request to update the sweet
  const res = await request(app)
    .put(`/api/sweets/${sweetId}`)
    .set('Authorization', `Bearer ${token}`)
    .send(updatedData);

  // Assertions for the response
  expect(res.statusCode).toEqual(200);
  expect(res.body.price).toBe(updatedData.price);
  expect(res.body.quantity).toBe(updatedData.quantity);

  // Bonus Assertion: Verify directly in the database
  const db = new sqlite3.Database('./sweets.db');
  const sweetFromDb = await new Promise((resolve, reject) => {
    db.get('SELECT * FROM sweets WHERE id = ?', [sweetId], (err, row) => {
      if (err) reject(err);
      resolve(row);
    });
  });
  db.close();
  expect(sweetFromDb.price).toBe(updatedData.price);
});

it('should delete an existing sweet', async () => {
  // Setup: Create a sweet so we have something to delete
  const postRes = await request(app)
    .post('/api/sweets')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Barfi', category: 'Milk-based', price: 4.00, quantity: 40 });

  const sweetId = postRes.body.id;

  // Action: Send a DELETE request
  const res = await request(app)
    .delete(`/api/sweets/${sweetId}`)
    .set('Authorization', `Bearer ${token}`);

  // Assertion for the response
  expect(res.statusCode).toEqual(200);
  expect(res.body.message).toBe('Sweet deleted successfully');

  // Verification: Check the database to make sure it's gone
  const db = new sqlite3.Database('./sweets.db');
  const sweetFromDb = await new Promise((resolve, reject) => {
    db.get('SELECT * FROM sweets WHERE id = ?', [sweetId], (err, row) => {
      if (err) reject(err);
      resolve(row);
    });
  });
  db.close();
  expect(sweetFromDb).toBeUndefined(); // It should not exist
});
it('should return a single sweet by its ID', async () => {
  const postRes = await request(app).post('/api/sweets').set('Authorization', `Bearer ${token}`).send({ name: 'Test Sweet', category: 'Testing', price: 1.00, quantity: 10 });
  const sweetId = postRes.body.id;

  const getRes = await request(app).get(`/api/sweets/${sweetId}`).set('Authorization', `Bearer ${token}`);

  expect(getRes.statusCode).toEqual(200);
  expect(getRes.body.id).toBe(sweetId);
  expect(getRes.body.name).toBe('Test Sweet');
});
});