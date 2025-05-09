require('../setupTestAgent');
const db = require('../../config/db');

jest.setTimeout(15000);

async function registerUser() {
  const res = await global.agent
    .post('/api/user/register')
    .send({
      email: `validate${Date.now()}@mail.com`,
      password: 'securePass123'
    });

  return res.body.token;
}

afterAll(async () => {
  await db.end();
});

describe('PUT /api/user/validate', () => {
  test('returns 422 when code is missing', async () => {
    const token = await registerUser();

    const res = await global.agent
      .put('/api/user/validate')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(422);
  });

  test('returns 400 when code is incorrect', async () => {
    const token = await registerUser();

    const res = await global.agent
      .put('/api/user/validate')
      .set('Authorization', `Bearer ${token}`)
      .send({ code: '000000' });

    expect(res.status).toBe(400);
  });
});