const request = require('supertest');
const app = require('./app'); // 引入你的Express應用程式
require('dotenv').config();

//測試時要修改seed
const test_index = '0025';

let user_1 = {};

describe('API Sign Up Test', () => {

  //註冊缺少資料測試 - name(400)
  it('註冊缺少資料測試 - name', async () => {
    const newUser = {
      email: `${test_index}_user_1@example.com`,
      password: `${test_index}_user_1`
    };

    const response = await request(app)
      .post('/api/1.0/users/signup')
      .send(newUser);

    console.log('case 1', response.status);
    expect(response.status).toBe(400);

  });
});

describe('API Sign Up Test', () => {

  //註冊缺少資料測試 - email(400)
  it('註冊缺少資料測試 - email', async () => {
    const newUser = {
      name: `${test_index}_user_1`,
      password: `${test_index}_user_1`
    };

    const response = await request(app)
      .post('/api/1.0/users/signup')
      .send(newUser);
    console.log('case 2', response.status);
    expect(response.status).toBe(400);

  });
});

describe('API Sign Up Test', () => {

  //註冊缺少資料測試 - password(400)
  it('註冊缺少資料測試 - password', async () => {
    const newUser = {
      name: `${test_index}_user_1`,
      email: `${test_index}_user_1@example.com`
    };

    const response = await request(app)
      .post('/api/1.0/users/signup')
      .send(newUser);
    console.log('case 3', response.status);
    expect(response.status).toBe(400);

  });
});

describe('API Sign Up Test', () => {

  //註冊(200)
  it('註冊成功', async () => {
    const newUser = {
      name: `${test_index}_user_1`,
      email: `${test_index}_user_1@example.com`,
      password: `${test_index}_user_1`
    };

    const response = await request(app)
      .post('/api/1.0/users/signup')
      .send(newUser);

    console.log('case 4', response.status);
    expect(response.status).toBe(200);
    expect(response.body.data.user.name).toBe(`${test_index}_user_1`);
    expect(response.body.data.user.email).toBe(`${test_index}_user_1@example.com`);
    user_1['access_token'] = response._body.data.access_token;
  });
});

describe('API Sign Up Test', () => {

  //註冊帳戶(email)已存在(403)
  it('註冊帳戶(email)已存在', async () => {
    const newUser = {
    name: `${test_index}_user_1`,
    email: `${test_index}_user_1@example.com`,
    password: `${test_index}_user_1`
    };

    const response = await request(app)
    .post('/api/1.0/users/signup')
    .send(newUser);
    console.log('case 5', response.status);
    expect(response.status).toBe(403);
  });

});

// describe('API Sign In Test', () => {
//   //登入缺少資料 - provider(400)
//   it('Sign in user 1', async () => {
//     const newUser = {
//       email: `${test_index}_user_1@example.com`,
//       password: `${test_index}_user_1`
//     };

//     const response = await request(app)
//       .post('/api/1.0/users/signin')
//       .send(newUser);
//     console.log('case 6', response.status);
//     expect(response.status).toBe(400);
//   });

//   //登入(200)
//   it('Sign in user 1', async () => {
//     const newUser = {
//       provider: 'native',
//       email: `${test_index}_user_1@example.com`,
//       password: `${test_index}_user_1`
//     };

//     const response = await request(app)
//       .post('/api/1.0/users/signin')
//       .send(newUser);
//     console.log(user_1)

//     expect(response.status).toBe(200);
//     expect(response.body.data.user.name).toBe(`${test_index}_user_1`);
//     expect(response.body.data.user.email).toBe(`${test_index}_user_1@example.com`);
//     console.log('case 7', response.status);
//     user_1['id'] = response.body.data.user.id;
//     user_1['access_token'] = response.body.data.access_token;
//   });

// });