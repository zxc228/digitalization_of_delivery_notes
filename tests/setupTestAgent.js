// tests/setupTestAgent.js
const request = require('supertest');
const app = require('../index');

let server;
let agent;

beforeAll(() => {
  server = app.listen();
  agent  = request.agent(server);
  global.agent = agent;
});

afterAll(async () => {
  await new Promise(resolve => server.close(resolve));
});