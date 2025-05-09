const request = require('supertest');
const app = require('../../index');
const db  = require('../../config/db');

let server, agent, token, clientId;

beforeAll(async () => {
  server = app.listen();
  agent  = request.agent(server);

  
  const reg = await agent.post('/api/user/register')
    .send({ email: `del${Date.now()}@mail.com`, password: 'securePass123' });

  await db.query('UPDATE users SET is_validated = true WHERE id=$1', [reg.body.user.id]);

  const login = await agent.post('/api/user/login')
    .send({ email: reg.body.user.email, password: 'securePass123' });

  token = login.body.token;

  
  const created = await agent.post('/api/client')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'ToDelete' });

  clientId = created.body.id;
});

afterAll(async () => {
  await server.close();
  await db.end();
});

jest.setTimeout(15000);

describe('DELETE /api/client/:id', () => {

  it('hard-deletes my client', async () => {
    const res = await agent
      .delete(`/api/client/${clientId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);

    
    const res2 = await agent
      .delete(`/api/client/${clientId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res2.statusCode).toBe(404);
  });

  it('returns 401 without token', async () => {
    const res = await agent.delete('/api/client/123');
    expect(res.statusCode).toBe(401);
  });
});