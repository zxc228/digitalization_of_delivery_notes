require('../setupTestAgent');
const db = require('../../config/db');

jest.setTimeout(15000);

async function userWithArchivedClient() {
  const email = `res${Date.now()}@mail.com`;
  const password = 'securePass123';

  const reg = await global.agent
    .post('/api/user/register')
    .send({ email, password });

  await db.query('UPDATE users SET is_validated = true WHERE id=$1', [reg.body.user.id]);
  const token = reg.body.token;

  const created = await global.agent
    .post('/api/client')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'RestoreMe' });

  const clientId = created.body.id;

  await global.agent
    .patch(`/api/client/${clientId}/archive`)
    .set('Authorization', `Bearer ${token}`);

  return { token, clientId };
}

afterAll(async () => {
  await db.end();
});

describe('PATCH /api/client/:id/restore', () => {
  test('restores archived client', async () => {
    const { token, clientId } = await userWithArchivedClient();

    const res = await global.agent
      .patch(`/api/client/${clientId}/restore`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.client.is_deleted).toBe(false);
  });

  test('returns 404 when already active', async () => {
    const { token, clientId } = await userWithArchivedClient();

    // Первый — восстанавливаем
    await global.agent
      .patch(`/api/client/${clientId}/restore`)
      .set('Authorization', `Bearer ${token}`);

    // Второй — должен вернуть 404
    const res = await global.agent
      .patch(`/api/client/${clientId}/restore`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
  });

  test('returns 401 without token', async () => {
    const { clientId } = await userWithArchivedClient();

    const res = await global.agent
      .patch(`/api/client/${clientId}/restore`);

    expect(res.statusCode).toBe(401);
  });
});