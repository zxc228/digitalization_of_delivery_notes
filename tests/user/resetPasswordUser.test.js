require('../setupTestAgent');
const db = require('../../config/db');

jest.setTimeout(15000);

async function getResetToken() {
  const email = `reset${Date.now()}@mail.com`;
  const password = 'securePass123';

  await global.agent
    .post('/api/user/register')
    .send({ email, password });

  await db.query('UPDATE users SET is_validated = true WHERE email = $1', [email]);

  const res = await global.agent
    .post('/api/user/recover-password')
    .send({ email });

  return res.body.resetToken;
}

afterAll(async () => {
  await db.end();
});

describe('POST /api/user/reset-password', () => {
  test('resets password with valid token', async () => {
    const token = await getResetToken();

    const res = await global.agent
      .post('/api/user/reset-password')
      .send({ token, new_password: 'newPass12345' });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/password reset successful/i);
  });

  test('returns 404 for invalid token', async () => {
    const res = await global.agent
      .post('/api/user/reset-password')
      .send({ token: 'invalid-token', new_password: 'newPass12345' });

    expect(res.status).toBe(404);
  });

  test('returns 422 for invalid input', async () => {
    const res = await global.agent
      .post('/api/user/reset-password')
      .send({ token: '', new_password: 'short' });

    expect(res.status).toBe(422);
  });
});