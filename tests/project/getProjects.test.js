require('../setupTestAgent');
const db = require('../../config/db');

jest.setTimeout(15000);

async function userWithProjects() {
  const email = `prlist${Date.now()}@mail.com`;
  const password = 'securePass123';

  const reg = await global.agent
    .post('/api/user/register')
    .send({ email, password });

  await db.query('UPDATE users SET is_validated = true WHERE id=$1', [reg.body.user.id]);
  const token = reg.body.token;

  const client = await global.agent
    .post('/api/client')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'ListClient' });

  await global.agent
    .post('/api/project')
    .set('Authorization', `Bearer ${token}`)
    .send({ client_id: client.body.id, name: 'Project A' });

  await global.agent
    .post('/api/project')
    .set('Authorization', `Bearer ${token}`)
    .send({ client_id: client.body.id, name: 'Project B' });

  return { token };
}

afterAll(async () => {
  await db.end();
});

describe('GET /api/project', () => {
  test('returns my projects array', async () => {
    const { token } = await userWithProjects();

    const res = await global.agent
      .get('/api/project')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
    expect(res.body[0]).toHaveProperty('name');
    expect(res.body[0]).toHaveProperty('client_id');
  });

  test('returns 401 without token', async () => {
    const { } = await userWithProjects(); // создаем данные, но не передаем токен

    const res = await global.agent
      .get('/api/project');

    expect(res.statusCode).toBe(401);
  });
});