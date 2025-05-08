const request = require('supertest');
const app = require('../../index');
const db = require('../../config/db');

describe('DELETE /api/user/me', () => {
  let token;
  const email = `delete${Date.now()}@example.com`;
  const password = 'securePass123';

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/user/register')
      .send({ email, password });

    token = res.body.token;

    await db.query(`UPDATE users SET is_validated = true WHERE email = $1`, [email]);
  });

  it('should soft delete user', async () => {
    const res = await request(app)
      .delete('/api/user/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/soft-deleted/);
  });

  it('should hard delete user', async () => {
    const res = await request(app)
      .post('/api/user/register')
      .send({ email: `hard${Date.now()}@test.com`, password });

    const tempToken = res.body.token;
    await db.query(`UPDATE users SET is_validated = true WHERE email = $1`, [res.body.user.email]);

    const delRes = await request(app)
      .delete('/api/user/me?soft=false')
      .set('Authorization', `Bearer ${tempToken}`);

    expect(delRes.statusCode).toBe(200);
    expect(delRes.body.message).toMatch(/permanently deleted/);
  });

  afterAll(async () => {
    await db.end();
  });
});
