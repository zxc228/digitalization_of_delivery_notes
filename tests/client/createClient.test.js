require('../setupTestAgent');
const db = require('../../config/db');

jest.setTimeout(15000);

async function createUserWithToken() {
  const email = `client${Date.now()}@mail.com`;
  const password = 'securePass123';

  const reg = await global.agent
    .post('/api/user/register')
    .send({ email, password });

  await db.query('UPDATE users SET is_validated=true WHERE id=$1', [reg.body.user.id]);

  const login = await global.agent
    .post('/api/user/login')
    .send({ email, password });

  return login.body.token;
}

afterAll(async () => {
  await db.end();
});

describe('POST /api/client', () => {
  test('creates a client', async () => {
    const token = await createUserWithToken();

    const res = await global.agent
      .post('/api/client')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'ACME Corp',
        email: 'contact@acme.com',
        phone: '+123456789',
        address: '123 Main Street'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('ACME Corp');
  });

  test('returns 400 when name missing', async () => {
    const token = await createUserWithToken();

    const res = await global.agent
      .post('/api/client')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.statusCode).toBe(400);
  });

  test('returns 401 without token', async () => {
    const res = await global.agent
      .post('/api/client')
      .send({ name: 'NoAuth' });

    expect(res.statusCode).toBe(401);
  });
});