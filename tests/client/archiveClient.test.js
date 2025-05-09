require('../setupTestAgent');
const db = require('../../config/db');

jest.setTimeout(15000);

async function userWithClientToArchive() {
  const email = `arch${Date.now()}@mail.com`;
  const password = 'securePass123';

  const reg = await global.agent.post('/api/user/register').send({ email, password });
  await db.query('UPDATE users SET is_validated=true WHERE id=$1', [reg.body.user.id]);
  const token = reg.body.token;

  const client = await global.agent
    .post('/api/client')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'To archive' });

  return { token, clientId: client.body.id };
}

afterAll(async () => {
  await db.end();
});

describe('PATCH /api/client/:id/archive', () => {
  test('archives my client', async () => {
    const { token, clientId } = await userWithClientToArchive();

    const res = await global.agent
      .patch(`/api/client/${clientId}/archive`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body.client.is_deleted).toBe(true);
  });

  test('returns 404 when already archived', async () => {
    const { token, clientId } = await userWithClientToArchive();

    // Первый вызов — архивируем
    await global.agent
      .patch(`/api/client/${clientId}/archive`)
      .set('Authorization', `Bearer ${token}`);

    // Второй вызов — ожидаем 404
    const res = await global.agent
      .patch(`/api/client/${clientId}/archive`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
  });

  test('returns 401 without token', async () => {
    const { clientId } = await userWithClientToArchive();

    const res = await global.agent
      .patch(`/api/client/${clientId}/archive`);

    expect(res.statusCode).toBe(401);
  });
});