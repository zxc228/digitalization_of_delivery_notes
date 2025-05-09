const request = require('supertest');
const app = require('../../index');
const db  = require('../../config/db');

let server, agent, token, clientId, projectId;

beforeAll(async () => {
  server = app.listen();
  agent  = request.agent(server);

 
  const reg = await agent.post('/api/user/register')
    .send({ email: `pupd${Date.now()}@mail.com`, password: 'securePass123' });
  await db.query('UPDATE users SET is_validated = true WHERE id=$1', [reg.body.user.id]);

  const login = await agent.post('/api/user/login')
    .send({ email: reg.body.user.email, password: 'securePass123' });
  token = login.body.token;

 
  const client = await agent.post('/api/client')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'UpdClient' });
  clientId = client.body.id;

  
  const proj = await agent.post('/api/project')
    .set('Authorization', `Bearer ${token}`)
    .send({ client_id: clientId, name: 'Old Name', description: 'v1' });
  projectId = proj.body.id;
});

afterAll(async () => {
  await server.close();
  await db.end();
});

describe('PUT /api/project/:id', () => {

  it('updates my project', async () => {
    const res = await agent
      .put(`/api/project/${projectId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated Name', description: 'v2 desc' });

    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Updated Name');
    expect(res.body.description).toBe('v2 desc');
  });

  it('returns 400 when name missing', async () => {
    const res = await agent
      .put(`/api/project/${projectId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ description: 'no name' });

    expect(res.statusCode).toBe(400);
  });

  it('returns 404 for wrong id', async () => {
    const res = await agent
      .put('/api/project/999999')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Ghost' });

    expect(res.statusCode).toBe(404);
  });

  it('returns 401 without token', async () => {
    const res = await agent
      .put(`/api/project/${projectId}`)
      .send({ name: 'No auth' });

    expect(res.statusCode).toBe(401);
  });
});