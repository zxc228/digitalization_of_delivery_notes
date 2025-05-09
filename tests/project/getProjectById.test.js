const request = require('supertest');
const app = require('../../index');
const db  = require('../../config/db');

let server, agent, token, clientId, projectId;

beforeAll(async () => {
  server = app.listen();
  agent  = request.agent(server);

  
  const reg = await agent.post('/api/user/register')
    .send({ email: `pget${Date.now()}@mail.com`, password: 'securePass123' });
  await db.query('UPDATE users SET is_validated = true WHERE id=$1', [reg.body.user.id]);

  const login = await agent.post('/api/user/login')
    .send({ email: reg.body.user.email, password: 'securePass123' });
  token = login.body.token;

 
  const client = await agent.post('/api/client')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'ProjClient' });
  clientId = client.body.id;

  
  const project = await agent.post('/api/project')
    .set('Authorization', `Bearer ${token}`)
    .send({ client_id: clientId, name: 'Single Project' });
  projectId = project.body.id;
});

afterAll(async () => {
  await server.close();
  await db.end();
});

describe('GET /api/project/:id', () => {

  it('returns my project', async () => {
    const res = await agent
      .get(`/api/project/${projectId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(projectId);
    expect(res.body.name).toBe('Single Project');
  });

  it('returns 404 for unknown id', async () => {
    const res = await agent
      .get('/api/project/999999')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
  });

  it('returns 401 without token', async () => {
    const res = await agent.get(`/api/project/${projectId}`);
    expect(res.statusCode).toBe(401);
  });
});