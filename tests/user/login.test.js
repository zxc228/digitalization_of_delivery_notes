const request = require('supertest');
const app = require('../../index');
const db = require('../../config/db');

describe('POST /api/user/login', () => {
  const email = `login${Date.now()}@example.com`;
  const password = 'securePass123';
  let token;

  beforeAll(async () => {
   
    const res = await request(app)
      .post('/api/user/register')
      .send({ email, password });

    token = res.body.token;

    
    await db.query(`UPDATE users SET is_validated = true WHERE email = $1`, [email]);
  });

  it('should log in successfully', async () => {
    const res = await request(app)
      .post('/api/user/login')
      .send({ email, password });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('email', email);
  });

  it('should fail with wrong password', async () => {
    const res = await request(app)
      .post('/api/user/login')
      .send({ email, password: 'wrongPass123' });

    expect(res.statusCode).toBe(401);
  });

  it('should fail if user does not exist', async () => {
    const res = await request(app)
      .post('/api/user/login')
      .send({ email: 'nouser@example.com', password: 'pass123456' });

    expect(res.statusCode).toBe(404);
  });

  afterAll(async () => {
    await db.end();
  });
});
