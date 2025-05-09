// const request = require('supertest');
// const path = require('path');
// const app = require('../../index');

// let token;

// beforeAll(async () => {
//   const res = await request(app)
//     .post('/api/user/login')
//     .send({
//       email: 'testrest1@example.com',
//       password: 'securePass123'
//     });

//   token = res.body.token;
// });


// describe('PATCH /api/user/profile-image', () => {
//   it('should upload a profile image', async () => {
//     const res = await request(app)
//       .patch('/api/user/profile-image')
//       .set('Authorization', `Bearer ${token}`)
//       .attach('profile_image', path.join(__dirname, '../../fetchimage.jpg'));

//     expect(res.statusCode).toBe(200);
//     expect(res.body).toHaveProperty('imageUrl');
//   });

//   it('should return 400 if no file is uploaded', async () => {
//     const res = await request(app)
//       .patch('/api/user/profile-image')
//       .set('Authorization', `Bearer ${token}`);

//     expect(res.statusCode).toBe(400);
//   });

//   it('should return 401 without auth token', async () => {
//     const res = await request(app)
//       .patch('/api/user/profile-image'); // без attach и без токена

//     expect(res.statusCode).toBe(401);
//   });
// });
