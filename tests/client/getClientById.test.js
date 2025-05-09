const request = require('supertest');
const app = require('../../index');
const db  = require('../../config/db');

let server, agent, token, clientId;

beforeAll(async () => {
  server = app.listen();
  agent  = request.agent(server);

  // создаём и валидируем пользователя
  const reg = await agent
    .post('/api/user/register')
    .send({ email: `id${Date.now()}@mail.com`, password: 'securePass123' });

  await db.query(
    'UPDATE users SET is_validated = true WHERE id = $1',
    [reg.body.user.id]
  );

  const login = await agent
    .post('/api/user/login')
    .send({ email: reg.body.user.email, password: 'securePass123' });

  token = login.body.token;

  // создаём клиента
  const c = await agent
    .post('/api/client')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Client X' });

  clientId = c.body.id;
});

afterAll(async () => {
  await server.close();
  await db.end();
});

describe('GET /api/client/:id', () => {

  it('returns my client by id', async () => {
    const res = await agent
      .get(`/api/client/${clientId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(clientId);
    expect(res.body.name).toBe('Client X');
  });

  it('returns 404 for unknown id', async () => {
    const res = await agent
      .get('/api/client/999999')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
  });

  it('returns 401 without token', async () => {
    const res = await agent.get(`/api/client/${clientId}`);
    expect(res.statusCode).toBe(401);
  });
});