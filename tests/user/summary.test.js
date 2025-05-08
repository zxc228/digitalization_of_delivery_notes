const request = require('supertest');
const app = require('../../index');
const db = require('../../config/db');

describe('GET /api/user/summary', () => {
  let token;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/user/register')
      .send({ email: `sum${Date.now()}@mail.com`, password: 'securePass123' });

    token = res.body.token;

    await db.query(`UPDATE users SET is_validated = true WHERE id = $1`, [res.body.user.id]);
  });

  it('should return summary stats', async () => {
    const res = await request(app)
      .get('/api/user/summary')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('numActiveUsers');
    expect(res.body).toHaveProperty('numDeletedUsers');
    expect(res.body).toHaveProperty('numInactiveUsers');
    expect(res.body).toHaveProperty('numActiveCompanyUsers');
    expect(res.body).toHaveProperty('numActivePersonalUsers');
  });

  it('should return 401 without token', async () => {
    const res = await request(app).get('/api/user/summary');
    expect(res.statusCode).toBe(401);
  });

  afterAll(async () => {
    await db.end();
  });
});
