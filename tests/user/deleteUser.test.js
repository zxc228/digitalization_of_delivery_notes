require('../setupTestAgent');
const db = require('../../config/db');

jest.setTimeout(15000);

async function createValidatedUser() {
  const email = `user${Date.now()}@mail.com`;
  const password = 'securePass123';

  const reg = await global.agent
    .post('/api/user/register')
    .send({ email, password });

  await db.query('UPDATE users SET is_validated = true WHERE email = $1', [email]);

  return reg.body.token;
}

afterAll(async () => {
  await db.end();
});

describe('DELETE /api/user/me', () => {
  test('soft delete returns 200 and “soft-deleted”', async () => {
    const token = await createValidatedUser();

    const res = await global.agent
      .delete('/api/user/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/soft-deleted/i);
  });

  test('hard delete returns 200 and “permanently deleted”', async () => {
    const token = await createValidatedUser();

    const res = await global.agent
      .delete('/api/user/me?soft=false')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/permanently deleted/i);
  });

  test('without token returns 401', async () => {
    const res = await global.agent.delete('/api/user/me');
    expect(res.status).toBe(401);
  });
});