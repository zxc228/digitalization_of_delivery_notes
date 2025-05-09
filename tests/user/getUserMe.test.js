const request = require('supertest');
const app     = require('../../index');
const db      = require('../../config/db');

let server;
let agent;


async function createValidatedUser() {
  const email = `me${Date.now()}@mail.com`;

  const reg = await agent
    .post('/api/user/register')
    .send({ email, password: 'securePass123' });

  await db.query('UPDATE users SET is_validated=true WHERE email=$1', [email]);

  return { token: reg.body.token, email };
}

beforeAll(() => {
  server = app.listen();
  agent  = request.agent(server);
});

afterAll(async () => {
  await server.close();
  await db.end();
});

describe('GET /api/user/me', () => {

  test('returns current user with valid token', async () => {
    const { token, email } = await createValidatedUser();

    const res = await agent
      .get('/api/user/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      email,
      status: 1
    });
    expect(res.body).toHaveProperty('_id');
  });

  test('without token returns 401', async () => {
    const res = await agent.get('/api/user/me');
    expect(res.status).toBe(401);
  });
});