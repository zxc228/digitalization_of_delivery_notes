const request = require('supertest');
const { Pool } = require('pg');
const app = require('../../index');          // Express-instance
const db  = require('../../config/db');      // pg.Pool (чтобы выключить)

let server;        // http.Server
let agent;         // supertest agent
let token;         // JWT

beforeAll(async () => {
  // ЗАПУСКАЕМ свой сервер (порт выбирает OS)
  server = app.listen();
  agent  = request.agent(server);

  // 1) регистрируем пользователя
  const reg = await agent
    .post('/api/user/register')
    .send({
      email: `test${Date.now()}@mail.com`,
      password: 'securePass123'
    });

  const userId = reg.body.user.id;

  // 2) помечаем как верифицированного
  await db.query('UPDATE users SET is_validated = true WHERE id = $1', [userId]);

  // 3) логинимся
  const login = await agent
    .post('/api/user/login')
    .send({
      email: reg.body.user.email,
      password: 'securePass123'
    });

  token = login.body.token;
});

afterAll(async () => {
  await server.close();
  await db.end();           // закрываем пул PG
});

jest.setTimeout(15000);

describe('POST /api/client', () => {

  it('creates a client', async () => {
    const res = await agent
      .post('/api/client')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'ACME Corp',
        email: 'contact@acme.com',
        phone: '+123456789',
        address: '123 Main Street'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('ACME Corp');
  });

  it('returns 400 when name missing', async () => {
    const res = await agent
      .post('/api/client')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.statusCode).toBe(400);
  });

  it('returns 401 without token', async () => {
    const res = await agent
      .post('/api/client')
      .send({ name: 'NoAuth' });

    expect(res.statusCode).toBe(401);
  });
});