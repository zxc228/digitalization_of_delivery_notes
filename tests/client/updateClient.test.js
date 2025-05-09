const request = require('supertest');
const app = require('../../index');
const db  = require('../../config/db');

let server, agent, token, clientId;

beforeAll(async () => {
  server = app.listen();
  agent  = request.agent(server);

  // 1) регистрируем + валидируем пользователя
  const reg = await agent
    .post('/api/user/register')
    .send({ email: `upd${Date.now()}@mail.com`, password: 'securePass123' });

  await db.query('UPDATE users SET is_validated = true WHERE id = $1', [reg.body.user.id]);

  // 2) логинимся
  const login = await agent
    .post('/api/user/login')
    .send({ email: reg.body.user.email, password: 'securePass123' });

  token = login.body.token;

  // 3) создаём клиента
  const created = await agent
    .post('/api/client')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Old Name' });

  clientId = created.body.id;
});

afterAll(async () => {
  await server.close();
  await db.end();
});

describe('PUT /api/client/:id', () => {

  it('updates my client', async () => {
    const res = await agent
      .put(`/api/client/${clientId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'New Name',
        email: 'new@mail.com'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('New Name');
    expect(res.body.email).toBe('new@mail.com');
  });

  it('returns 400 when name missing', async () => {
    const res = await agent
      .put(`/api/client/${clientId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'x@y.com' });

    expect(res.statusCode).toBe(400);
  });

  it('returns 404 for wrong id', async () => {
    const res = await agent
      .put('/api/client/999999')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Does not matter' });

    expect(res.statusCode).toBe(404);
  });

  it('returns 401 without token', async () => {
    const res = await agent
      .put(`/api/client/${clientId}`)
      .send({ name: 'NoAuth' });

    expect(res.statusCode).toBe(401);
  });
});