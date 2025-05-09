require('../setupTestAgent');
const db = require('../../config/db');

jest.setTimeout(15000);

async function createValidatedUser() {
  const email = `me${Date.now()}@mail.com`;
  const password = 'securePass123';

  const reg = await global.agent
    .post('/api/user/register')
    .send({ email, password });

  await db.query('UPDATE users SET is_validated = true WHERE email=$1', [email]);

  return { token: reg.body.token, email };
}

afterAll(async () => {
  await db.end();
});

describe('GET /api/user/me', () => {
  test('returns current user with valid token', async () => {
    const { token, email } = await createValidatedUser();

    const res = await global.agent
      .get('/api/user/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      email,
      status: 1
    });
    expect(res.body).toHaveProperty('_id');
  });

  test('without token returns 401', async () => {
    const res = await global.agent.get('/api/user/me');
    expect(res.status).toBe(401);
  });
});