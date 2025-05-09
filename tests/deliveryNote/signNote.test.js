const request = require('supertest');
const path    = require('path');
const fs      = require('fs');
const app     = require('../../index');
const db      = require('../../config/db');
const { randomBytes } = require('crypto');

// mock ipfsUploader BEFORE require-ing the route code
jest.mock('../../utils/ipfsUploader', () => {
  const path = require('path');
  return jest.fn(async fp => `ipfs://fake/${path.basename(fp)}`);
});

let server, agent;

beforeAll(() => {
  server = app.listen();
  agent  = request.agent(server);
});

afterAll(async () => {
  await server.close();
  await db.end();
});

const createUserToken = async () => {
    const email    = `dn${Date.now()}-${randomBytes(4).toString('hex')}@mail.com`;
  const pass  = 'securePass123';
  const reg   = await agent.post('/api/user/register').send({ email, password: pass });
  await db.query('UPDATE users SET is_validated=true WHERE id=$1', [reg.body.user.id]);
  return reg.body.token;
};

const createProject = async token => {
  const client = await agent.post('/api/client')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'ACME' });

  const project = await agent.post('/api/project')
    .set('Authorization', `Bearer ${token}`)
    .send({ client_id: client.body.id, name: 'Landing' });

  return project.body.id;
};

const createNote = async (token, projectId) => {
  const note = await agent.post('/api/deliverynote')
    .set('Authorization', `Bearer ${token}`)
    .send({
      project_id: projectId,
      items: [{ type:'hour', description:'Dev', quantity:2, unit_price:100 }]
    });
  return note.body.noteId;
};

jest.setTimeout(15000);

describe('POST /api/deliverynote/:id/sign', () => {

  test('signs note locally', async () => {
    const token   = await createUserToken();
    const projId  = await createProject(token);
    const noteId  = await createNote(token, projId);

    const res = await agent.post(`/api/deliverynote/${noteId}/sign?storage=local`)
      .set('Authorization', `Bearer ${token}`)
      .attach('signature', path.join(__dirname, '../../images.jpeg'));

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('signatureUrl');
    expect(res.body.pdfUrl).toBeNull();
    // файл реально перемещён
    expect(fs.existsSync(path.join('uploads', 'signatures',
                                   path.basename(res.body.signatureUrl)))).toBe(true);
  });

  test('signs note + uploads to fake IPFS', async () => {
    const token   = await createUserToken();
    const projId  = await createProject(token);
    const noteId  = await createNote(token, projId);

    const res = await agent.post(`/api/deliverynote/${noteId}/sign`) // ipfs by default
      .set('Authorization', `Bearer ${token}`)
      .attach('signature', path.join(__dirname, '../../images.jpeg'));

    expect(res.status).toBe(200);
    expect(res.body.signatureUrl).toMatch(/^ipfs:\/\/fake\//);
    expect(res.body.pdfUrl).toMatch(/^ipfs:\/\/fake\//);
  });

  test('rejects second signing', async () => {
    const token   = await createUserToken();
    const projId  = await createProject(token);
    const noteId  = await createNote(token, projId);

    // first sign – ok
    await agent.post(`/api/deliverynote/${noteId}/sign`)
      .set('Authorization', `Bearer ${token}`)
      .attach('signature', path.join(__dirname, '../../images.jpeg'));

    // second sign – should fail
    const res = await agent.post(`/api/deliverynote/${noteId}/sign`)
      .set('Authorization', `Bearer ${token}`)
      .attach('signature', path.join(__dirname, '../../images.jpeg'));

    expect(res.status).toBe(400);
  });
});