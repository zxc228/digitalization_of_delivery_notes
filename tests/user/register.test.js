const request = require('supertest');
const app = require('../../index'); 
const db = require('../../config/db');

describe('POST /api/user/register', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/user/register')
      .send({
        email: `testuser${Date.now()}@example.com`,
        password: 'securePass123'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('id');
    expect(res.body.user).toHaveProperty('email');
  });

  it('should fail on invalid email', async () => {
    const res = await request(app)
      .post('/api/user/register')
      .send({
        email: 'invalid-email',
        password: '12345678'
      });

    expect(res.statusCode).toBe(422);
  });

  it('should fail if password is too short', async () => {
    const res = await request(app)
      .post('/api/user/register')
      .send({
        email: 'valid@example.com',
        password: '123'
      });

    expect(res.statusCode).toBe(422);
  });

  afterAll(async () => {
    await db.end(); 
  });
});
