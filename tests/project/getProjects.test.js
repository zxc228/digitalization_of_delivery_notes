const request = require('supertest');
const app = require('../../index');
const db  = require('../../config/db');

let server, agent, token, clientId;

beforeAll(async () => {
  server = app.listen();
  agent  = request.agent(server);

  
  const reg = await agent.post('/api/user/register')
    .send({ email: `prlist${Date.now()}@mail.com`, password: 'securePass123' });
  await db.query('UPDATE users SET is_validated = true WHERE id=$1', [reg.body.user.id]);

  const login = await agent.post('/api/user/login')
    .send({ email: reg.body.user.email, password: 'securePass123' });
  token = login.body.token;

  
  const client = await agent.post('/api/client')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'ListClient' });
  clientId = client.body.id;

  
  await agent.post('/api/project')
    .set('Authorization', `Bearer ${token}`)
    .send({ client_id: clientId, name: 'Project A' });

  await agent.post('/api/project')
    .set('Authorization', `Bearer ${token}`)
    .send({ client_id: clientId, name: 'Project B' });
});

afterAll(async () => {
  await server.close();
  await db.end();
});

describe('GET /api/project', () => {

  it('returns my projects array', async () => {
    const res = await agent
      .get('/api/project')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
    expect(res.body[0]).toHaveProperty('name');
    expect(res.body[0]).toHaveProperty('client_id');
  });

  it('returns 401 without token', async () => {
    const res = await agent.get('/api/project');
    expect(res.statusCode).toBe(401);
  });
});