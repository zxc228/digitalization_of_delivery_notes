require('../setupTestAgent');
const db = require('../../config/db');

jest.setTimeout(15000);

async function userWithClient() {
  const email = `upd${Date.now()}@mail.com`;
  const password = 'securePass123';

  const reg = await global.agent
    .post('/api/user/register')
    .send({ email, password });

  await db.query('UPDATE users SET is_validated = true WHERE id = $1', [reg.body.user.id]);

  const login = await global.agent
    .post('/api/user/login')
    .send({ email, password });

  const token = login.body.token;

  const created = await global.agent
    .post('/api/client')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Old Name' });

  return { token, clientId: created.body.id };
}

afterAll(async () => {
  await db.end();
});

describe('PUT /api/client/:id', () => {
  test('updates my client', async () => {
    const { token, clientId } = await userWithClient();

    const res = await global.agent
      .put(`/api/client/${clientId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'New Name',
        email: 'new@mail.com'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('New Name');
    expect(res.body.email).toBe('new@mail.com');
  });

  test('returns 400 when name missing', async () => {
    const { token, clientId } = await userWithClient();

    const res = await global.agent
      .put(`/api/client/${clientId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'x@y.com' });

    expect(res.statusCode).toBe(400);
  });

  test('returns 404 for wrong id', async () => {
    const { token } = await userWithClient();

    const res = await global.agent
      .put('/api/client/999999')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Does not matter' });

    expect(res.statusCode).toBe(404);
  });

  test('returns 401 without token', async () => {
    const { clientId } = await userWithClient();

    const res = await global.agent
      .put(`/api/client/${clientId}`)
      .send({ name: 'NoAuth' });

    expect(res.statusCode).toBe(401);
  });
});