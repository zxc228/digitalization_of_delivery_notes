require('../setupTestAgent');
const db = require('../../config/db');

jest.setTimeout(15000);

async function createUserWithProject() {
  const email = `del${Date.now()}@mail.com`;
  const password = 'strongPass123';

  const reg = await global.agent.post('/api/user/register').send({ email, password });
  await db.query('UPDATE users SET is_validated=true WHERE id=$1', [reg.body.user.id]);
  const token = reg.body.token;

  const c = await global.agent
    .post('/api/client')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Client', email: 'cl@i.ent' });

  const p = await global.agent
    .post('/api/project')
    .set('Authorization', `Bearer ${token}`)
    .send({ client_id: c.body.id, name: 'Project X' });

  return { token, projectId: p.body.id, userId: reg.body.user.id };
}

afterAll(async () => {
  await db.end();
});

describe('POST /api/deliverynote', () => {
  test('creates a new delivery note with items', async () => {
    const { token, projectId } = await createUserWithProject();

    const res = await global.agent
      .post('/api/deliverynote')
      .set('Authorization', `Bearer ${token}`)
      .send({
        project_id: projectId,
        items: [{ type: 'hour', description: 'Design', quantity: 3, unit_price: 100 }]
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toMatch(/created/i);
    expect(res.body.noteId).toBeDefined();
  });

  test('returns 400 if items array is missing or empty', async () => {
    const { token, projectId } = await createUserWithProject();

    const res = await global.agent
      .post('/api/deliverynote')
      .set('Authorization', `Bearer ${token}`)
      .send({ project_id: projectId });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
    expect(typeof res.body.message).toBe('string');
    expect(res.body.message.toLowerCase()).toMatch(/required/);
  });

  test('returns 404 if project does not belong to user', async () => {
    const { projectId } = await createUserWithProject(); // belongs to user1
    const { token: otherToken } = await createUserWithProject(); // this is user2

    const res = await global.agent
      .post('/api/deliverynote')
      .set('Authorization', `Bearer ${otherToken}`)
      .send({
        project_id: projectId,
        items: [{ type: 'hour', description: 'Hack attempt', quantity: 1, unit_price: 1 }]
      });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('message');
    expect(typeof res.body.message).toBe('string');
    expect(res.body.message.toLowerCase()).toMatch(/not found|not yours/);
  });
});
