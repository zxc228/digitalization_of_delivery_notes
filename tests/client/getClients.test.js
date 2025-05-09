require('../setupTestAgent');
const db = require('../../config/db');

jest.setTimeout(15000);

async function userWithClients() {
  const email = `list${Date.now()}@mail.com`;
  const password = 'securePass123';

  const reg = await global.agent
    .post('/api/user/register')
    .send({ email, password });

  await db.query(`UPDATE users SET is_validated = true WHERE id = $1`, [reg.body.user.id]);

  const login = await global.agent
    .post('/api/user/login')
    .send({ email, password });

  const token = login.body.token;

  await global.agent
    .post('/api/client')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Client A' });

  await global.agent
    .post('/api/client')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Client B' });

  return { token };
}

afterAll(async () => {
  await db.end();
});

describe('GET /api/client', () => {
  test('returns list of my clients', async () => {
    const { token } = await userWithClients();

    const res = await global.agent
      .get('/api/client')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
    expect(res.body[0]).toHaveProperty('name');
  });

  test('returns 401 without token', async () => {
    const res = await global.agent.get('/api/client');
    expect(res.statusCode).toBe(401);
  });
});