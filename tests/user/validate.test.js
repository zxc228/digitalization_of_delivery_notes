const request = require('supertest');
const app = require('../../index');
const db = require('../../config/db');

describe('PUT /api/user/validate', () => {
  let token;

  beforeAll(async () => {
    const res = await request(app).post('/api/user/register').send({
      email: `validate${Date.now()}@example.com`,
      password: 'securePass123'
    });
    token = res.body.token;
  });

  it('should return 422 if code is missing', async () => {
    const res = await request(app)
      .put('/api/user/validate')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.statusCode).toBe(422);
  });

  it('should return 400 if code is incorrect', async () => {
    const res = await request(app)
      .put('/api/user/validate')
      .set('Authorization', `Bearer ${token}`)
      .send({ code: '000000' });

    expect(res.statusCode).toBe(400);
  });

  afterAll(async () => {
    await db.end();
  });
});
