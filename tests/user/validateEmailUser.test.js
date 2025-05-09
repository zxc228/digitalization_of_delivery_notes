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

async function registerUser() {
  const res = await agent
    .post('/api/user/register')
    .send({
      email: `validate${Date.now()}@mail.com`,
      password: 'securePass123'
    });

  return res.body.token;          
}

describe('PUT /api/user/validate', () => {

  test('returns 422 when code is missing', async () => {
    const token = await registerUser();

    const res = await agent
      .put('/api/user/validate')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(422);
  });

  test('returns 400 when code is incorrect', async () => {
    const token = await registerUser();

    const res = await agent
      .put('/api/user/validate')
      .set('Authorization', `Bearer ${token}`)
      .send({ code: '000000' });

    expect(res.status).toBe(400);
  });
});