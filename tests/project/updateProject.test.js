require('../setupTestAgent');
const db = require('../../config/db');

jest.setTimeout(15000);

async function userWithProjectToUpdate() {
  const email = `pupd${Date.now()}@mail.com`;
  const password = 'securePass123';

  const reg = await global.agent
    .post('/api/user/register')
    .send({ email, password });

  await db.query('UPDATE users SET is_validated = true WHERE id=$1', [reg.body.user.id]);
  const token = reg.body.token;

  const client = await global.agent
    .post('/api/client')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'UpdClient' });

  const project = await global.agent
    .post('/api/project')
    .set('Authorization', `Bearer ${token}`)
    .send({ client_id: client.body.id, name: 'Old Name', description: 'v1' });

  return { token, projectId: project.body.id };
}

afterAll(async () => {
  await db.end();
});

describe('PUT /api/project/:id', () => {
  test('updates my project', async () => {
    const { token, projectId } = await userWithProjectToUpdate();

    const res = await global.agent
      .put(`/api/project/${projectId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated Name', description: 'v2 desc' });

    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Updated Name');
    expect(res.body.description).toBe('v2 desc');
  });

  test('returns 400 when name missing', async () => {
    const { token, projectId } = await userWithProjectToUpdate();

    const res = await global.agent
      .put(`/api/project/${projectId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ description: 'no name' });

    expect(res.statusCode).toBe(400);
  });

  test('returns 404 for wrong id', async () => {
    const { token } = await userWithProjectToUpdate();

    const res = await global.agent
      .put('/api/project/999999')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Ghost' });

    expect(res.statusCode).toBe(404);
  });

  test('returns 401 without token', async () => {
    const { projectId } = await userWithProjectToUpdate();

    const res = await global.agent
      .put(`/api/project/${projectId}`)
      .send({ name: 'No auth' });

    expect(res.statusCode).toBe(401);
  });
});