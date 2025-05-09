require('../setupTestAgent');
const fs = require('fs');
const db = require('../../config/db');

jest.setTimeout(15000);

afterAll(async () => {
  await db.end();
});

async function bootstrap() {
  const email = `pdf${Date.now()}@mail.com`;
  const pass  = 'securePass123';

  const reg = await global.agent.post('/api/user/register').send({ email, password: pass });
  await db.query('update users set is_validated=true where id=$1', [reg.body.user.id]);

  const token = reg.body.token;

  const client = await global.agent
    .post('/api/client')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'PDF Co' });

  const project = await global.agent
    .post('/api/project')
    .set('Authorization', `Bearer ${token}`)
    .send({ client_id: client.body.id, name: 'Proj' });

  const note = await global.agent
    .post('/api/deliverynote')
    .set('Authorization', `Bearer ${token}`)
    .send({
      project_id: project.body.id,
      items: [{ type: 'hour', description: 'Work', quantity: 2, unit_price: 50 }]
    });

  return { token, noteId: note.body.noteId };
}

describe('GET /api/deliverynote/pdf/:id (local)', () => {
  test('streams PDF with 200 status', async () => {
    const { token, noteId } = await bootstrap();

    const res = await global.agent
      .get(`/api/deliverynote/pdf/${noteId}?storage=local`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/application\/pdf/);
    expect(res.body.slice(0, 4).toString()).toBe('%PDF'); // первые байты PDF
  });
});