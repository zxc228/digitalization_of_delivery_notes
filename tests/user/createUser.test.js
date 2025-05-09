const request = require('supertest');
const app     = require('../../index');
const db      = require('../../config/db');

let server;
let agent;

beforeAll(() => {
  server = app.listen();          // dynamic port
  agent  = request.agent(server);
});

afterAll(async () => {
  await server.close();
  await db.end();
});

describe('POST /api/user/register', () => {

  test('registers a new user', async () => {
    const res = await agent
      .post('/api/user/register')
      .send({
        email: `user${Date.now()}@mail.com`,
        password: 'securePass123'
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toEqual(
      expect.objectContaining({ id: expect.any(Number), email: expect.any(String) })
    );
  });

  test('returns 422 for invalid email', async () => {
    const res = await agent
      .post('/api/user/register')
      .send({ email: 'bad', password: 'securePass123' });

    expect(res.status).toBe(422);
  });

  test('returns 422 for short password', async () => {
    const res = await agent
      .post('/api/user/register')
      .send({ email: 'valid@mail.com', password: '123' });

    expect(res.status).toBe(422);
  });
});