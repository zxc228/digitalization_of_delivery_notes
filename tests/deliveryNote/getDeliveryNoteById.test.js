require('../setupTestAgent');
const { randomBytes } = require('crypto');
const db = require('../../config/db');

jest.setTimeout(20_000); // 20 секунд на suite

async function createUserValidated() {
  const password = 'securePass123';

  for (let i = 0; i < 3; i++) {
    const email = `dn${Date.now()}-${randomBytes(6).toString('hex')}@mail.com`;

    const reg = await global.agent.post('/api/user/register').send({ email, password });

    if (reg.status === 200) {
      await db.query('UPDATE users SET is_validated=true WHERE id=$1', [reg.body.user.id]);
      return { token: reg.body.token };
    }

    if (reg.status !== 409) {
      throw new Error(`Register failed: HTTP ${reg.status}`);
    }
  }

  throw new Error('Could not register unique e-mail after 3 attempts');
}

async function createNoteAndReturnId(token) {
  const c = await global.agent
    .post('/api/client')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'ACME', email: 'acme@mail.com' });

  const p = await global.agent
    .post('/api/project')
    .set('Authorization', `Bearer ${token}`)
    .send({ client_id: c.body.id, name: 'Landing' });

  const n = await global.agent
    .post('/api/deliverynote')
    .set('Authorization', `Bearer ${token}`)
    .send({
      project_id: p.body.id,
      items: [{ type: 'hour', description: 'Dev', quantity: 3, unit_price: 60 }]
    });

  return n.body.noteId;
}

afterAll(async () => {
  await db.end();
});

describe('GET /api/deliverynote/:id', () => {

  test('returns one note for owner', async () => {
    const { token } = await createUserValidated();
    const noteId = await createNoteAndReturnId(token);

    const res = await global.agent
      .get(`/api/deliverynote/${noteId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', noteId);
    expect(Array.isArray(res.body.items)).toBe(true);
  });

  test('returns 404 when note is not mine', async () => {
    const { token: tokenA } = await createUserValidated();
    const noteId = await createNoteAndReturnId(tokenA);

    const { token: tokenB } = await createUserValidated();

    const res = await global.agent
      .get(`/api/deliverynote/${noteId}`)
      .set('Authorization', `Bearer ${tokenB}`);

    expect(res.status).toBe(404);
  });

  test('returns 401 without token', async () => {
    const res = await global.agent.get('/api/deliverynote/1');
    expect(res.status).toBe(401);
  });
});