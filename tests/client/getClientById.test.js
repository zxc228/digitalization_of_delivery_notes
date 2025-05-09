require('../setupTestAgent');
const db = require('../../config/db');

jest.setTimeout(15000);

async function userWithClient() {
  const email = `id${Date.now()}@mail.com`;
  const password = 'securePass123';

  const reg = await global.agent
    .post('/api/user/register')
    .send({ email, password });

  await db.query(
    'UPDATE users SET is_validated = true WHERE id = $1',
    [reg.body.user.id]
  );

  const login = await global.agent
    .post('/api/user/login')
    .send({ email, password });

  const token = login.body.token;

  const created = await global.agent
    .post('/api/client')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Client X' });

  return { token, clientId: created.body.id };
}

afterAll(async () => {
  await db.end();
});

describe('GET /api/client/:id', () => {
  test('returns my client by id', async () => {
    const { token, clientId } = await userWithClient();

    const res = await global.agent
      .get(`/api/client/${clientId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(clientId);
    expect(res.body.name).toBe('Client X');
  });

  test('returns 404 for unknown id', async () => {
    const { token } = await userWithClient();

    const res = await global.agent
      .get('/api/client/999999')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
  });

  test('returns 401 without token', async () => {
    const { clientId } = await userWithClient();

    const res = await global.agent.get(`/api/client/${clientId}`);
    expect(res.statusCode).toBe(401);
  });
});