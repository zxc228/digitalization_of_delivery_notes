const request = require('supertest');
const app     = require('../../index');
const db      = require('../../config/db');

let server;
let agent;

beforeAll(() => {
  server = app.listen();         
  agent  = request.agent(server); 
});

afterAll(async () => {
  await server.close();           
  await db.end();                 
});


async function registerValidatedUser() {
  const email    = `recover${Date.now()}@mail.com`;
  const password = 'securePass123';

  await agent.post('/api/user/register').send({ email, password });
  await db.query('UPDATE users SET is_validated=true WHERE email=$1', [email]);

  return email;
}

describe('POST /api/user/recover-password', () => {

  test('generates reset token for existing email', async () => {
    const email = await registerValidatedUser();

    const res = await agent
      .post('/api/user/recover-password')
      .send({ email });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('resetToken');
  });

  test('returns 404 for unknown email', async () => {
    const res = await agent
      .post('/api/user/recover-password')
      .send({ email: 'unknown@mail.com' });

    expect(res.status).toBe(404);
  });

  test('returns 422 for invalid email format', async () => {
    const res = await agent
      .post('/api/user/recover-password')
      .send({ email: 'bad-email' });

    expect(res.status).toBe(422);
  });
});