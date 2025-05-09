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


async function getResetToken() {
  const email    = `reset${Date.now()}@mail.com`;
  const password = 'securePass123';

  // регистрация
  await agent.post('/api/user/register').send({ email, password });
  await db.query('UPDATE users SET is_validated=true WHERE email=$1', [email]);

  // запрос токена
  const res = await agent
    .post('/api/user/recover-password')
    .send({ email });

  return res.body.resetToken;
}

describe('POST /api/user/reset-password', () => {

  test('resets password with valid token', async () => {
    const token = await getResetToken();

    const res = await agent
      .post('/api/user/reset-password')
      .send({ token, new_password: 'newPass12345' });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/password reset successful/i);
  });

  test('returns 404 for invalid token', async () => {
    const res = await agent
      .post('/api/user/reset-password')
      .send({ token: 'invalid-token', new_password: 'newPass12345' });

    expect(res.status).toBe(404);
  });

  test('returns 422 for invalid input', async () => {
    const res = await agent
      .post('/api/user/reset-password')
      .send({ token: '', new_password: 'short' });

    expect(res.status).toBe(422);
  });
});