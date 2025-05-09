require('../setupTestAgent');
const db = require('../../config/db');

jest.setTimeout(15000);

async function registerAndValidate() {
  const email = `login${Date.now()}@mail.com`;
  const password = 'securePass123';

  const reg = await global.agent
    .post('/api/user/register')
    .send({ email, password });

  await db.query('UPDATE users SET is_validated = true WHERE email = $1', [email]);

  return { email, password };
}

afterAll(async () => {
  await db.end();
});

describe('POST /api/user/login', () => {
  test('logs in successfully with correct credentials', async () => {
    const { email, password } = await registerAndValidate();

    const res = await global.agent
      .post('/api/user/login')
      .send({ email, password });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('email', email);
  });

  test('fails with wrong password', async () => {
    const { email } = await registerAndValidate();

    const res = await global.agent
      .post('/api/user/login')
      .send({ email, password: 'wrongPass123' });

    expect(res.status).toBe(401);
  });

  test('fails when user does not exist', async () => {
    const res = await global.agent
      .post('/api/user/login')
      .send({ email: 'nouser@example.com', password: 'pass123456' });

    expect(res.status).toBe(404);
  });
});