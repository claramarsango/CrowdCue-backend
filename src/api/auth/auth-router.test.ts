import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import connectDB from '../../database/mongoDB.js';
import { LoginRequest, RegisterRequest } from '../../types/auth-types.js';
import app from '../../app.js';
import { encryptPassword } from './auth-utils.js';
import { UserModel } from '../users/user-model.js';

describe('Given an app with an auth router', () => {
  let mongoServer: MongoMemoryServer;
  const OLD_ENV = process.env;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUrl = mongoServer.getUri();
    await connectDB(mongoUrl);
  });

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });

  afterAll(async () => {
    await mongoServer.stop();
    await mongoose.connection.close();
    process.env = OLD_ENV;
  });

  describe('When a user wants to register', () => {
    describe('with a valid email and password,', () => {
      test('then it should be registered', async () => {
        const newUser: RegisterRequest = {
          email: 'mock@email.com',
          password: 'mockPassword',
          confirmedPassword: 'mockPassword',
        };

        await request(app).post('/auth/register').send(newUser).expect(201);
      });

      test('but the user already exists, then it should show an error message', async () => {
        const existingUser: RegisterRequest = {
          email: 'mock@email.com',
          password: 'mockPassword',
          confirmedPassword: 'mockPassword',
        };

        const response = await request(app)
          .post('/auth/register')
          .send(existingUser)
          .expect(409);

        expect(response.body.msg).toEqual(
          'An account with that email already exists',
        );
      });
    });

    test('but the passwords do not match, then it should show an error message', async () => {
      const invalidNewUser: RegisterRequest = {
        email: 'newMock@email.com',
        password: 'mockPassword',
        confirmedPassword: 'wrongPassword',
      };

      const response = await request(app)
        .post('/auth/register')
        .send(invalidNewUser)
        .expect(403);

      expect(response.body.msg).toEqual('Passwords must match');
    });
  });

  describe('When a user wants to login with an invalid email format,', () => {
    test('then it should throw a 400 error and show the type of error', async () => {
      const invalidUser: LoginRequest = {
        email: 'invalid.email',
        password: 'mockPassword',
      };

      const response = await request(app)
        .post('/auth/login')
        .send(invalidUser)
        .expect(400);

      expect(response.body.msg).toEqual('"email" must be a valid email');
    });
  });

  describe('When a user wants to login with an invalid password format,', () => {
    test('then it should throw a 400 error and show a descriptive message', async () => {
      const invalidUser = {
        email: 'mock@email.com',
        password: 45,
      };

      const response = await request(app)
        .post('/auth/login')
        .send(invalidUser)
        .expect(400);

      expect(response.body.msg).toEqual('"password" must be a string');
    });
  });

  describe('When a user wants to login with a valid email and password,', () => {
    const nonExistentUser: LoginRequest = {
      email: 'nonexistent@email.com',
      password: 'mockPassword',
    };

    test('and the password encryption key environment variable does not exist, then it should return a 500 error', async () => {
      delete process.env.PASSWORD_ENCRYPTION_KEY;

      const response = await request(app)
        .post('/auth/login')
        .send(nonExistentUser)
        .expect(500);

      expect(response.status).toEqual(500);
    });

    test('and the user does not exist, then it should return a 404 error', async () => {
      await request(app).post('/auth/login').send(nonExistentUser).expect(404);
    });

    test('and the password encryption algorithm environment variable does not exist, then it should return a 500 error', async () => {
      delete process.env.PASSWORD_ENCRYPTION_ALGORITHM;

      const response = await request(app)
        .post('/auth/login')
        .send(nonExistentUser)
        .expect(500);

      expect(response.status).toEqual(500);
    });

    test('and the user does not exist, then it should return a 404 error', async () => {
      await request(app).post('/auth/login').send(nonExistentUser).expect(404);
    });

    test('and the user exists, then it should be logged in', async () => {
      const userDb: LoginRequest = {
        ...nonExistentUser,
        password: encryptPassword(nonExistentUser.password),
      };
      await UserModel.create(userDb);

      await request(app).post('/auth/login').send(nonExistentUser).expect(201);
    });

    test('and the jwt secret environment variable does not exist, then it should return a 500 error', async () => {
      delete process.env.JWT_SECRET;

      const response = await request(app)
        .post('/auth/login')
        .send(nonExistentUser)
        .expect(500);

      expect(response.status).toEqual(500);
    });
  });
});
