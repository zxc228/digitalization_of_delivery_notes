require('../setupTestAgent');
const db = require('../../config/db');

jest.setTimeout(15000);

async function userWithProjectToDelete() {
  const email = `pdel${Date.now()}@mail.com`;
  const password = 'securePass123';

  const reg = await global.agent
    .post('/api/user/register')
    .send({ email, password });

  await db.query('UPDATE users SET is_validated = true WHERE id=$1', [reg.body.user.id]);
  const token = reg.body.token;

  const client = await global.agent
    .post('/api/client')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'DelClient' });

  const project = await global.agent
    .post('/api/project')
    .set('Authorization', `Bearer ${token}`)
    .send({ client_id: client.body.id, name: 'Disposable' });

  return { token, projectId: project.body.id };
}

afterAll(async () => {
  await db.end();
});

describe('DELETE /api/project/:id', () => {
  test('hard-deletes my project', async () => {
    const { token, projectId } = await userWithProjectToDelete();

    const res = await global.agent
      .delete(`/api/project/${projectId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);
  });

  test('returns 404 on second delete', async () => {
    const { token, projectId } = await userWithProjectToDelete();

    await global.agent
      .delete(`/api/project/${projectId}`)
      .set('Authorization', `Bearer ${token}`);

    const res = await global.agent
      .delete(`/api/project/${projectId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
  });

  test('returns 401 without token', async () => {
    const { projectId } = await userWithProjectToDelete();

    const res = await global.agent
      .delete(`/api/project/${projectId}`);

    expect(res.statusCode).toBe(401);
  });
});