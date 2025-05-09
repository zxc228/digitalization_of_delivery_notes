require('../setupTestAgent'); 
const db = require('../config/db');
const { randomBytes } = require('crypto');

jest.setTimeout(15000);

async function createUser() {
  const email = `dn${Date.now()}-${randomBytes(4).toString('hex')}@mail.com`;
  const password = 'securePass123';

  const reg = await global.agent.post('/api/user/register').send({ email, password });
  await db.query('UPDATE users SET is_validated=true WHERE id=$1', [reg.body.user.id]);

  return { token: reg.body.token, userId: reg.body.user.id };
}

async function createProject(token) {
  const client = await global.agent
    .post('/api/client')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'ACME', email: 'c@ac.me' });

  const project = await global.agent
    .post('/api/project')
    .set('Authorization', `Bearer ${token}`)
    .send({ client_id: client.body.id, name: 'Landing', description: 'v1' });

  return project.body.id;
}
afterAll(async () => {
  await db.end(); 
});


describe('POST /api/deliverynote', () => {

  test('creates note with items', async () => {
    const { token } = await createUser();
    const projectId = await createProject(token);

    const res = await global.agent
      .post('/api/deliverynote')
      .set('Authorization', `Bearer ${token}`)
      .send({
        project_id: projectId,
        items: [
          { type: 'hour', description: 'Design', quantity: 4, unit_price: 50 }
        ]
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('noteId');
  });

  test('returns 400 when items missing', async () => {
    const { token } = await createUser();
    const projectId = await createProject(token);

    const res = await global.agent
      .post('/api/deliverynote')
      .set('Authorization', `Bearer ${token}`)
      .send({ project_id: projectId, items: [] });

    expect(res.status).toBe(400);
  });

  test('returns 404 when project not mine', async () => {
    const { token: tokenA } = await createUser();
    const projectId = await createProject(tokenA);

    const { token: tokenB } = await createUser();

    const res = await global.agent
      .post('/api/deliverynote')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({
        project_id: projectId,
        items: [{ type: 'hour', description: 'Hack', quantity: 1, unit_price: 1 }]
      });

    expect(res.status).toBe(404);
  });
});