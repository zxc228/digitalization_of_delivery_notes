const request = require('supertest');
const app = require('../../index');
const db  = require('../../config/db');

let server, agent, token;

beforeAll(async () => {
  server = app.listen();
  agent  = request.agent(server);

  
  const reg = await agent.post('/api/user/register').send({
    email: `list${Date.now()}@mail.com`,
    password: 'securePass123'
  });
  const userId = reg.body.user.id;
  await db.query(`UPDATE users SET is_validated = true WHERE id = $1`, [userId]);

 
  const login = await agent.post('/api/user/login').send({
    email: reg.body.user.email,
    password: 'securePass123'
  });
  token = login.body.token;

  await agent
    .post('/api/client')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Client A' });

  await agent
    .post('/api/client')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Client B' });
});

afterAll(async () => {
  await server.close();
  await db.end();
});

jest.setTimeout(15000);

describe('GET /api/client', () => {

  it('returns list of my clients', async () => {
    const res = await agent
      .get('/api/client')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
    expect(res.body[0]).toHaveProperty('name');
  });

  it('returns 401 without token', async () => {
    const res = await agent.get('/api/client');
    expect(res.statusCode).toBe(401);
  });
});