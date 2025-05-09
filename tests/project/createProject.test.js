require('../setupTestAgent');
const db = require('../../config/db');

jest.setTimeout(15000);

async function userWithClient() {
  const email = `proj${Date.now()}@mail.com`;
  const password = 'securePass123';

  const reg = await global.agent
    .post('/api/user/register')
    .send({ email, password });

  await db.query('UPDATE users SET is_validated = true WHERE id=$1', [reg.body.user.id]);
  const token = reg.body.token;

  const client = await global.agent
    .post('/api/client')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Client for Project' });

  return { token, clientId: client.body.id };
}

afterAll(async () => {
  await db.end();
});

describe('POST /api/project', () => {
  test('creates a project under my client', async () => {
    const { token, clientId } = await userWithClient();

    const res = await global.agent
      .post('/api/project')
      .set('Authorization', `Bearer ${token}`)
      .send({
        client_id: clientId,
        name: 'New Project',
        description: 'Cool stuff'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.client_id).toBe(clientId);
    expect(res.body.name).toBe('New Project');
  });

  test('returns 400 when required fields missing', async () => {
    const { token } = await userWithClient();

    const res = await global.agent
      .post('/api/project')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'No client id' });

    expect(res.statusCode).toBe(400);
  });

  test('returns 404 if client not mine', async () => {
    const { token } = await userWithClient();

    const res = await global.agent
      .post('/api/project')
      .set('Authorization', `Bearer ${token}`)
      .send({ client_id: 999999, name: 'Ghost' });

    expect(res.statusCode).toBe(404);
  });

  test('returns 401 without token', async () => {
    const { clientId } = await userWithClient();

    const res = await global.agent
      .post('/api/project')
      .send({ client_id: clientId, name: 'No auth' });

    expect(res.statusCode).toBe(401);
  });
});