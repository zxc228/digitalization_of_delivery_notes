const request = require('supertest');
const app = require('../../index');
const db = require('../../config/db');

describe('GET /api/user/me', () => {
  let token, email;

  beforeAll(async () => {
    email = `me${Date.now()}@example.com`;
    const password = 'securePass123';

    const res = await request(app)
      .post('/api/user/register')
      .send({ email, password });

    token = res.body.token;

    await db.query(`UPDATE users SET is_validated = true WHERE email = $1`, [email]);
  });

  it('should return current user info with valid token', async () => {
    const res = await request(app)
      .get('/api/user/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('_id');
    expect(res.body).toHaveProperty('email', email);
    expect(res.body).toHaveProperty('status', 1);
  });

  it('should return 401 if no token provided', async () => {
    const res = await request(app)
      .get('/api/user/me');

    expect(res.statusCode).toBe(401);
  });

  afterAll(async () => {
    await db.end();
  });
});
