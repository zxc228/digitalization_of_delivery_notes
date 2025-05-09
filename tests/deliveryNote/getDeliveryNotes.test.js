require('../setupTestAgent');
const db = require('../../config/db');

jest.setTimeout(15000);

async function createValidatedUser() {
  const email = `dnlist${Date.now()}@mail.com`;
  const password = 'securePass123';

  const reg = await global.agent.post('/api/user/register').send({ email, password });
  await db.query('UPDATE users SET is_validated=true WHERE id=$1', [reg.body.user.id]);

  return { token: reg.body.token };
}

async function setupProjectWithNote(token) {
  const client = await global.agent
    .post('/api/client')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'ACME', email: 'acme@mail.com' });

  const project = await global.agent
    .post('/api/project')
    .set('Authorization', `Bearer ${token}`)
    .send({ client_id: client.body.id, name: 'Landing Page' });

  await global.agent
    .post('/api/deliverynote')
    .set('Authorization', `Bearer ${token}`)
    .send({
      project_id: project.body.id,
      items: [
        { type: 'hour', description: 'Design', quantity: 4, unit_price: 45 }
      ]
    });
}

afterAll(async () => {
  await db.end();
});

describe('GET /api/deliverynote', () => {

  test('returns array of notes for current user', async () => {
    const { token } = await createValidatedUser();
    await setupProjectWithNote(token);

    const res = await global.agent
      .get('/api/deliverynote')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0]).toHaveProperty('id');
    expect(res.body[0]).toHaveProperty('project_id');
  });

  test('returns 401 when token is missing', async () => {
    const res = await global.agent.get('/api/deliverynote');
    expect(res.status).toBe(401);
  });
});