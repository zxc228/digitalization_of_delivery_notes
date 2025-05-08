const request = require('supertest');
const app = require('../../index');
const db = require('../../config/db');

describe('PUT /api/user/register (onboarding)', () => {
  let token;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/user/register')
      .send({
        email: `onboard${Date.now()}@test.com`,
        password: 'securePass123'
      });

    token = res.body.token;
    await db.query(`UPDATE users SET is_validated = true WHERE id = $1`, [res.body.user.id]);
  });

  it('should update personal data', async () => {
    const res = await request(app)
      .put('/api/user/register')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Alice',
        surnames: 'Walker',
        nif: '11111111H'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/updated/);
  });

  it('should update company data', async () => {
    const res = await request(app)
      .put('/api/user/register')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Bob',
        surnames: 'Builder',
        nif: '22222222J',
        company_name: 'BuildCo',
        cif: 'ES12345678',
        address: 'Builder Street 7'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/updated/);
  });

  it('should return 422 if missing personal fields', async () => {
    const res = await request(app)
      .put('/api/user/register')
      .set('Authorization', `Bearer ${token}`)
      .send({
        company_name: 'NoName Inc'
      });

    expect(res.statusCode).toBe(422);
  });

  afterAll(async () => {
    await db.end();
  });
});
