require('../setupTestAgent');
const db = require('../../config/db');

jest.setTimeout(15000);

async function userWithArchivedProject() {
  const email = `prest${Date.now()}@mail.com`;
  const password = 'securePass123';

  const reg = await global.agent
    .post('/api/user/register')
    .send({ email, password });

  await db.query('UPDATE users SET is_validated = true WHERE id=$1', [reg.body.user.id]);
  const token = reg.body.token;

  const client = await global.agent
    .post('/api/client')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'RestoreClient' });

  const project = await global.agent
    .post('/api/project')
    .set('Authorization', `Bearer ${token}`)
    .send({ client_id: client.body.id, name: 'Restorable' });

  await global.agent
    .patch(`/api/project/${project.body.id}/archive`)
    .set('Authorization', `Bearer ${token}`);

  return { token, projectId: project.body.id };
}

afterAll(async () => {
  await db.end();
});

describe('PATCH /api/project/:id/restore', () => {
  test('restores my archived project', async () => {
    const { token, projectId } = await userWithArchivedProject();

    const res = await global.agent
      .patch(`/api/project/${projectId}/restore`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.project.is_deleted).toBe(false);
  });

  test('returns 404 when already active', async () => {
    const { token, projectId } = await userWithArchivedProject();

  
    await global.agent
      .patch(`/api/project/${projectId}/restore`)
      .set('Authorization', `Bearer ${token}`);

    
    const res = await global.agent
      .patch(`/api/project/${projectId}/restore`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
  });

  test('returns 401 without token', async () => {
    const { projectId } = await userWithArchivedProject();

    const res = await global.agent
      .patch(`/api/project/${projectId}/restore`);

    expect(res.statusCode).toBe(401);
  });
});