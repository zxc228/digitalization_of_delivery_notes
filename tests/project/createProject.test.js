const request = require('supertest');
const app  = require('../../index');
const db   = require('../../config/db');

let server, agent, token, clientId;

beforeAll(async () => {
  
  server = app.listen();
  agent  = request.agent(server);


  const reg = await agent.post('/api/user/register')
    .send({ email: `proj${Date.now()}@mail.com`, password: 'securePass123' });
  await db.query('UPDATE users SET is_validated = true WHERE id=$1', [reg.body.user.id]);

  const login = await agent.post('/api/user/login')
    .send({ email: reg.body.user.email, password: 'securePass123' });
  token = login.body.token;

  
  const client = await agent.post('/api/client')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Client for Project' });
  clientId = client.body.id;
});

afterAll(async () => {
  await server.close();
  await db.end();
});

describe('POST /api/project', () => {

  it('creates a project under my client', async () => {
    const res = await agent
      .post('/api/project')
      .set('Authorization', `Bearer ${token}`)
      .send({
        client_id: clientId,
        name: 'New Project',
        description: 'Cool stuff'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.client_id).toBe(clientId);
    expect(res.body.name).toBe('New Project');
  });

  it('returns 400 when required fields missing', async () => {
    const res = await agent
      .post('/api/project')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'No client id' });

    expect(res.statusCode).toBe(400);
  });

  it('returns 404 if client not mine', async () => {
    const res = await agent
      .post('/api/project')
      .set('Authorization', `Bearer ${token}`)
      .send({ client_id: 999999, name: 'Ghost' });

    expect(res.statusCode).toBe(404);
  });

  it('returns 401 without token', async () => {
    const res = await agent
      .post('/api/project')
      .send({ client_id: clientId, name: 'No auth' });

    expect(res.statusCode).toBe(401);
  });
});