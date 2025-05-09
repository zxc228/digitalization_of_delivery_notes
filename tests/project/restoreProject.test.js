const request = require('supertest');
const app = require('../../index');
const db  = require('../../config/db');

let server, agent, token, clientId, projectId;

beforeAll(async () => {
  server = app.listen();
  agent  = request.agent(server);

  
  const reg = await agent.post('/api/user/register')
    .send({ email: `prest${Date.now()}@mail.com`, password: 'securePass123' });
  await db.query('UPDATE users SET is_validated = true WHERE id=$1', [reg.body.user.id]);

  const login = await agent.post('/api/user/login')
    .send({ email: reg.body.user.email, password: 'securePass123' });
  token = login.body.token;

  
  clientId = (await agent.post('/api/client')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'RestoreClient' })).body.id;

  
  projectId = (await agent.post('/api/project')
    .set('Authorization', `Bearer ${token}`)
    .send({ client_id: clientId, name: 'Restorable' })).body.id;

  
  await agent
    .patch(`/api/project/${projectId}/archive`)
    .set('Authorization', `Bearer ${token}`);
});

afterAll(async () => {
  await server.close();
  await db.end();
});

describe('PATCH /api/project/:id/restore', () => {

  it('restores my archived project', async () => {
    const res = await agent
      .patch(`/api/project/${projectId}/restore`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.project.is_deleted).toBe(false);
  });

  it('returns 404 when already active', async () => {
    const res = await agent
      .patch(`/api/project/${projectId}/restore`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
  });

  it('returns 401 without token', async () => {
    const res = await agent
      .patch(`/api/project/${projectId}/restore`);
    expect(res.statusCode).toBe(401);
  });
});