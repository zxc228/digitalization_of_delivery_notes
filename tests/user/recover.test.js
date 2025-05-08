const request = require('supertest');
const app = require('../../index');
const db = require('../../config/db');

describe('POST /api/user/recover-password', () => {
  const email = `recover${Date.now()}@example.com`;
  const password = 'securePass123';

  beforeAll(async () => {
    await request(app)
      .post('/api/user/register')
      .send({ email, password });

    await db.query(`UPDATE users SET is_validated = true WHERE email = $1`, [email]);
  });

  it('should generate reset token for valid email', async () => {
    const res = await request(app)
      .post('/api/user/recover-password')
      .send({ email });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('resetToken');
  });

  it('should return 404 for unknown email', async () => {
    const res = await request(app)
      .post('/api/user/recover-password')
      .send({ email: 'nonexistent@example.com' });

    expect(res.statusCode).toBe(404);
  });

  it('should return 422 for invalid email format', async () => {
    const res = await request(app)
      .post('/api/user/recover-password')
      .send({ email: 'invalidemail' });

    expect(res.statusCode).toBe(422);
  });

  afterAll(async () => {
    await db.end();
  });
});
