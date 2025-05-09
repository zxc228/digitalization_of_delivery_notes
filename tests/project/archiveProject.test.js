require('../setupTestAgent');
const db = require('../../config/db');

jest.setTimeout(15000);

async function userWithProjectToArchive() {
  const email = `parch${Date.now()}@mail.com`;
  const password = 'securePass123';

  const reg = await global.agent
    .post('/api/user/register')
    .send({ email, password });

  await db.query('UPDATE users SET is_validated = true WHERE id=$1', [reg.body.user.id]);
  const token = reg.body.token;

  const client = await global.agent
    .post('/api/client')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'ArcClient' });

  const project = await global.agent
    .post('/api/project')
    .set('Authorization', `Bearer ${token}`)
    .send({ client_id: client.body.id, name: 'ArcProj' });

  return { token, projectId: project.body.id };
}

afterAll(async () => {
  await db.end();
});

describe('PATCH /api/project/:id/archive', () => {
  test('archives my project', async () => {
    const { token, projectId } = await userWithProjectToArchive();

    const res = await global.agent
      .patch(`/api/project/${projectId}/archive`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.project.is_deleted).toBe(true);
  });

  test('returns 404 when already archived', async () => {
    const { token, projectId } = await userWithProjectToArchive();

    // Первый вызов — архивируем
    await global.agent
      .patch(`/api/project/${projectId}/archive`)
      .set('Authorization', `Bearer ${token}`);

    // Второй вызов — уже архивировано
    const res = await global.agent
      .patch(`/api/project/${projectId}/archive`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
  });

  test('returns 401 without token', async () => {
    const { projectId } = await userWithProjectToArchive();

    const res = await global.agent
      .patch(`/api/project/${projectId}/archive`);

    expect(res.statusCode).toBe(401);
  });
});