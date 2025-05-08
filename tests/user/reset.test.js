const request = require('supertest');
const app = require('../../index');
const db = require('../../config/db');

describe('POST /api/user/reset-password', () => {
  const email = `reset${Date.now()}@example.com`;
  const password = 'securePass123';
  let resetToken;

  beforeAll(async () => {
    await request(app)
      .post('/api/user/register')
      .send({ email, password });

    await db.query(`UPDATE users SET is_validated = true WHERE email = $1`, [email]);

    const res = await request(app)
      .post('/api/user/recover-password')
      .send({ email });

    resetToken = res.body.resetToken;
  });

  it('should reset password with valid token', async () => {
    const res = await request(app)
      .post('/api/user/reset-password')
      .send({
        token: resetToken,
        new_password: 'newPass12345'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/Password reset successful/);
  });

  it('should return 404 for invalid token', async () => {
    const res = await request(app)
      .post('/api/user/reset-password')
      .send({
        token: 'invalid-token',
        new_password: 'newPass12345'
      });

    expect(res.statusCode).toBe(404);
  });

  it('should return 422 for invalid input', async () => {
    const res = await request(app)
      .post('/api/user/reset-password')
      .send({ token: '', new_password: 'short' });

    expect(res.statusCode).toBe(422);
  });

  afterAll(async () => {
    await db.end();
  });
});
