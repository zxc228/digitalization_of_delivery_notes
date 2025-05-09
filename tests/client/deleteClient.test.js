require('../setupTestAgent');
const db = require('../../config/db');

jest.setTimeout(15000);

async function userWithClientToDelete() {
  const email = `del${Date.now()}@mail.com`;
  const password = 'securePass123';

  const reg = await global.agent
    .post('/api/user/register')
    .send({ email, password });

  await db.query('UPDATE users SET is_validated = true WHERE id=$1', [reg.body.user.id]);
  const token = reg.body.token;

  const created = await global.agent
    .post('/api/client')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'ToDelete' });

  return { token, clientId: created.body.id };
}

afterAll(async () => {
  await db.end();
});

describe('DELETE /api/client/:id', () => {
  test('hard-deletes my client', async () => {
    const { token, clientId } = await userWithClientToDelete();

    const res = await global.agent
      .delete(`/api/client/${clientId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);

    // Второй вызов должен вернуть 404
    const res2 = await global.agent
      .delete(`/api/client/${clientId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res2.statusCode).toBe(404);
  });

  test('returns 401 without token', async () => {
    const { clientId } = await userWithClientToDelete();

    const res = await global.agent
      .delete(`/api/client/${clientId}`);

    expect(res.statusCode).toBe(401);
  });
});