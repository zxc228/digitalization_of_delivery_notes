require('../setupTestAgent');
const db = require('../../config/db');

jest.setTimeout(15000);

async function createValidatedUser() {
  const email = `sum${Date.now()}@mail.com`;
  const password = 'securePass123';

  const reg = await global.agent
    .post('/api/user/register')
    .send({ email, password });

  await db.query('UPDATE users SET is_validated = true WHERE id = $1', [reg.body.user.id]);

  return reg.body.token;
}

afterAll(async () => {
  await db.end();
});

describe('GET /api/user/summary', () => {
  test('returns summary stats with token', async () => {
    const token = await createValidatedUser();

    const res = await global.agent
      .get('/api/user/summary')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        numActiveUsers:           expect.any(Number),
        numDeletedUsers:          expect.any(Number),
        numInactiveUsers:         expect.any(Number),
        numActiveCompanyUsers:    expect.any(Number),
        numActivePersonalUsers:   expect.any(Number)
      })
    );
  });

  test('without token returns 401', async () => {
    const res = await global.agent.get('/api/user/summary');
    expect(res.status).toBe(401);
  });
});