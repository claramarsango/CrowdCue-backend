import { NextFunction, Request, Response } from 'express';
import { UserModel } from '../users/user-model.js';
import { loginUserController } from './auth-controllers.js';
import dotenv from 'dotenv';
import { generateJWTToken } from './auth-utils.js';
dotenv.config();

const OLD_ENV = process.env;

beforeEach(() => {
  jest.resetModules();
  process.env = { ...OLD_ENV };
});

afterAll(() => {
  process.env = OLD_ENV;
});
describe('Given a controller to log in a user', () => {
  const mockRequest = {
    body: {
      email: 'mock@email.com',
      password: 'mockPassword',
    },
  } as Partial<Request>;

  const mockResponse = {
    json: jest.fn(),
    status: jest.fn().mockReturnThis(),
  } as Partial<Response>;

  UserModel.findOne = jest
    .fn()
    .mockImplementation(() => ({ exec: jest.fn().mockResolvedValue(null) }));

  const next = jest.fn();

  test('When the password encryption algorithm environment variable does not exist', async () => {
    delete process.env.PASSWORD_ENCRYPTION_ALGORITHM;

    await loginUserController(
      mockRequest as Request,
      mockResponse as Response,
      next as NextFunction,
    );

    expect(next).toHaveBeenCalled();
  });

  test('When the password encryption key environment variable does not exist', async () => {
    delete process.env.PASSWORD_ENCRYPTION_KEY;

    await loginUserController(
      mockRequest as Request,
      mockResponse as Response,
      next as NextFunction,
    );

    expect(next).toHaveBeenCalled();
  });

  test('When the user does not exist, then it should return a 404 error', async () => {
    await loginUserController(
      mockRequest as Request,
      mockResponse as Response,
      next as NextFunction,
    );

    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'This user does not exist',
    });
    expect(mockResponse.status).toHaveBeenCalledWith(404);
  });

  test('When the jwt secret environment variable does not exist', async () => {
    delete process.env.JWT_SECRET;

    UserModel.findOne = jest
      .fn()
      .mockImplementation(() => ({ exec: jest.fn().mockResolvedValue(1) }));

    await loginUserController(
      mockRequest as Request,
      mockResponse as Response,
      next as NextFunction,
    );

    expect(next).toHaveBeenCalled();
  });

  test('When the user exists, then it should return the access token', async () => {
    UserModel.findOne = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });

    await loginUserController(
      mockRequest as Request,
      mockResponse as Response,
      next as NextFunction,
    );

    expect(mockResponse.json).toHaveBeenCalledWith({
      accessToken: generateJWTToken(mockRequest.body.email),
    });
    expect(mockResponse.status).toHaveBeenCalledWith(201);
  });
});
