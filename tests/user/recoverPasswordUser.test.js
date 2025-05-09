require('../setupTestAgent');
const db = require('../../config/db');

jest.setTimeout(15000);

async function registerValidatedUser() {
  const email = `recover${Date.now()}@mail.com`;
  const password = 'securePass123';

  await global.agent
    .post('/api/user/register')
    .send({ email, password });

  await db.query('UPDATE users SET is_validated = true WHERE email = $1', [email]);

  return email;
}

afterAll(async () => {
  await db.end();
});

describe('POST /api/user/recover-password', () => {
  test('generates reset token for existing email', async () => {
    const email = await registerValidatedUser();

    const res = await global.agent
      .post('/api/user/recover-password')
      .send({ email });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('resetToken');
  });

  test('returns 404 for unknown email', async () => {
    const res = await global.agent
      .post('/api/user/recover-password')
      .send({ email: 'unknown@mail.com' });

    expect(res.status).toBe(404);
  });

  test('returns 422 for invalid email format', async () => {
    const res = await global.agent
      .post('/api/user/recover-password')
      .send({ email: 'bad-email' });

    expect(res.status).toBe(422);
  });
});