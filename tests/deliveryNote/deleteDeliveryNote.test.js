require('../setupTestAgent');
const db = require('../../config/db');

jest.setTimeout(15000);

async function userWithUnsignedNote() {
  const email = `del${Date.now()}@mail.com`;
  const password = 'securePass123';

  const reg = await global.agent.post('/api/user/register').send({ email, password });
  await db.query('UPDATE users SET is_validated=true WHERE id=$1', [reg.body.user.id]);
  const token = reg.body.token;

  const c = await global.agent
    .post('/api/client')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'ACME', email: 'c@ac.me' });

  const p = await global.agent
    .post('/api/project')
    .set('Authorization', `Bearer ${token}`)
    .send({ client_id: c.body.id, name: 'Landing' });

  const n = await global.agent
    .post('/api/deliverynote')
    .set('Authorization', `Bearer ${token}`)
    .send({
      project_id: p.body.id,
      items: [{ type: 'hour', description: 'Dev', quantity: 2, unit_price: 50 }]
    });

  return { token, noteId: n.body.noteId };
}

afterAll(async () => {
  await db.end();
});

describe('DELETE /api/deliverynote/:id', () => {

  test('deletes unsigned note', async () => {
    const { token, noteId } = await userWithUnsignedNote();

    const res = await global.agent
      .delete(`/api/deliverynote/${noteId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/deleted successfully/);
  });

  test('returns 400 when note is signed', async () => {
    const { token, noteId } = await userWithUnsignedNote();

    await db.query('UPDATE delivery_notes SET signed=true WHERE id=$1', [noteId]);

    const res = await global.agent
      .delete(`/api/deliverynote/${noteId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
  });

  test('returns 401 without token', async () => {
    const res = await global.agent.delete('/api/deliverynote/123');
    expect(res.status).toBe(401);
  });
});