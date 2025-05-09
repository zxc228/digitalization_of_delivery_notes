const request = require('supertest');
const app = require('../../index');
const db  = require('../../config/db');

let server, agent, token, clientId, projectId;

beforeAll(async () => {
  server = app.listen();
  agent  = request.agent(server);

 
  const reg = await agent.post('/api/user/register')
    .send({ email: `parch${Date.now()}@mail.com`, password: 'securePass123' });
  await db.query('UPDATE users SET is_validated = true WHERE id=$1', [reg.body.user.id]);

  const login = await agent.post('/api/user/login')
    .send({ email: reg.body.user.email, password: 'securePass123' });
  token = login.body.token;

  
  clientId = (await agent.post('/api/client')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'ArcClient' })).body.id;

  projectId = (await agent.post('/api/project')
    .set('Authorization', `Bearer ${token}`)
    .send({ client_id: clientId, name: 'ArcProj' })).body.id;
});

afterAll(async () => {
  await server.close();
  await db.end();
});

describe('PATCH /api/project/:id/archive', () => {

  it('archives my project', async () => {
    const res = await agent
      .patch(`/api/project/${projectId}/archive`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.project.is_deleted).toBe(true);
  });

  it('returns 404 when already archived', async () => {
    const res = await agent
      .patch(`/api/project/${projectId}/archive`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
  });

  it('returns 401 without token', async () => {
    const res = await agent
      .patch(`/api/project/${projectId}/archive`);

    expect(res.statusCode).toBe(401);
  });
});