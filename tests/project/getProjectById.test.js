require('../setupTestAgent');
const db = require('../../config/db');

jest.setTimeout(15000);

async function userWithProject() {
  const email = `pget${Date.now()}@mail.com`;
  const password = 'securePass123';

  const reg = await global.agent
    .post('/api/user/register')
    .send({ email, password });

  await db.query('UPDATE users SET is_validated = true WHERE id=$1', [reg.body.user.id]);
  const token = reg.body.token;

  const client = await global.agent
    .post('/api/client')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'ProjClient' });

  const project = await global.agent
    .post('/api/project')
    .set('Authorization', `Bearer ${token}`)
    .send({ client_id: client.body.id, name: 'Single Project' });

  return { token, projectId: project.body.id };
}

afterAll(async () => {
  await db.end();
});

describe('GET /api/project/:id', () => {
  test('returns my project', async () => {
    const { token, projectId } = await userWithProject();

    const res = await global.agent
      .get(`/api/project/${projectId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(projectId);
    expect(res.body.name).toBe('Single Project');
  });

  test('returns 404 for unknown id', async () => {
    const { token } = await userWithProject();

    const res = await global.agent
      .get('/api/project/999999')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
  });

  test('returns 401 without token', async () => {
    const { projectId } = await userWithProject();

    const res = await global.agent
      .get(`/api/project/${projectId}`);

    expect(res.statusCode).toBe(401);
  });
});