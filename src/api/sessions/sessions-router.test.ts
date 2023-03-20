import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../../app';
import connectDB from '../../database/mongoDB';
import { generateJWTToken } from '../auth/auth-utils';

jest.mock('@supabase/supabase-js', () => {
  const data = {
    publicUrl: 'https://example.com/photo.webp',
  };
  return {
    createClient: jest.fn().mockImplementation(() => ({
      storage: {
        from: jest.fn().mockReturnValue({
          upload: jest.fn().mockResolvedValue({
            error: null,
            data: {
              ...data,
            },
          }),
          getPublicUrl: jest.fn().mockReturnValue({
            error: null,
            data: {
              ...data,
            },
          }),
        }),
      },
    })),
  };
});

describe('Given a sessions router,', () => {
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

  const sessionMockRequest = {
    body: {
      title: 'sessionTitle',
    },
    file: { buffer: undefined },
  };

  const mockToken = generateJWTToken('123456789123456789123456');

  describe('when the user wants to create a session,', () => {
    test('if they have a token, they should be able to', async () => {
      await request(app)
        .post('/api/v1/sessions/create')
        .send(sessionMockRequest.body)
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(201);
    });

    test('if the user does not have a token, then they should not be able to', async () => {
      await request(app).get('/api/v1/sessions').expect(401);
    });

    test('if the jwt environment does not exist, the server should respond with a 500 error', async () => {
      delete process.env.JWT_SECRET;

      await request(app)
        .post('/api/v1/sessions/create')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(500);
    });
  });

  describe('when the user wants to receive a list of sessions,', () => {
    test('if they have a token, they should be able to get it', async () => {
      await request(app)
        .get('/api/v1/sessions/explore')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(200);
    });
  });

  /* Test('when the user has a token, then they should be able to create a session', async () => {
    await request(app)
      .post('/api/v1/sessions/create')
      .send(sessionMockRequest.body)
      .set('Authorization', `Bearer ${mockToken}`)
      .expect(201);
  }); */

  /* test('when the user does not have a token, then they should not be able to create a session', async () => {
    await request(app).get('/api/v1/sessions').expect(401);
  }); */

  /* test('when the jwt environment variable does not exist, the server should respond with a 500 error', async () => {
    delete process.env.JWT_SECRET;

    await request(app)
      .post('/api/v1/sessions/create')
      .set('Authorization', `Bearer ${mockToken}`)
      .expect(500);
  }); */
});
