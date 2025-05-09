require('../setupTestAgent');
const db = require('../../config/db');

jest.setTimeout(15000);

async function createValidatedUser() {
  const email = `onboard${Date.now()}@mail.com`;
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

describe('PUT /api/user/register (onboarding)', () => {
  test('updates personal data', async () => {
    const token = await createValidatedUser();

    const res = await global.agent
      .put('/api/user/register')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Alice',
        surnames: 'Walker',
        nif: '11111111H'
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/updated/i);
  });

  test('updates personal + company data', async () => {
    const token = await createValidatedUser();

    const res = await global.agent
      .put('/api/user/register')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Bob',
        surnames: 'Builder',
        nif: '22222222J',
        company_name: 'BuildCo',
        cif: 'ES12345678',
        address: 'Builder Street 7'
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/updated/i);
  });

  test('returns 422 when personal fields are missing', async () => {
    const token = await createValidatedUser();

    const res = await global.agent
      .put('/api/user/register')
      .set('Authorization', `Bearer ${token}`)
      .send({ company_name: 'NoName Inc' });

    expect(res.status).toBe(422);
  });
});