import { NextFunction, Request, Response } from 'express';
import { UserModel } from '../users/user-model.js';
import {
  loginUserController,
  registerUserController,
} from './auth-controllers.js';
import dotenv from 'dotenv';
import { encryptPassword, generateJWTToken } from './auth-utils.js';
import mongoose from 'mongoose';
dotenv.config();

const OLD_ENV = process.env;

beforeEach(() => {
  jest.resetModules();
  process.env = { ...OLD_ENV };
});

afterAll(() => {
  process.env = OLD_ENV;
});

describe('Given a controller to register a user,', () => {
  const mockRequest = {
    body: {
      email: 'mock@email.com',
      password: 'mockPassword',
      confirmedPassword: 'mockPassword',
    },
  } as Partial<Request>;

  const mockResponse = {
    json: jest.fn(),
    status: jest.fn().mockReturnThis(),
  } as Partial<Response>;

  const next = jest.fn();

  UserModel.findOne = jest
    .fn()
    .mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

  test('When the user enters a valid email and password, then it should receive a confirmation', async () => {
    UserModel.create = jest.fn();

    await registerUserController(
      mockRequest as Request,
      mockResponse as Response,
      next,
    );

    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith({
      msg: 'User registered successfully!',
    });
  });

  test('When the passwords do not match, then an error should be thrown and passed on', async () => {
    const invalidMockRequest = {
      body: {
        email: 'mock@email.com',
        password: 'mockPassword',
        confirmedPassword: 'wrongPassword',
      },
    } as Partial<Request>;

    await registerUserController(
      invalidMockRequest as Request,
      mockResponse as Response,
      next,
    );

    expect(next).toHaveBeenCalled();
  });

  test('When the user is already registered, then an error should be thrown and passed on', async () => {
    UserModel.findOne = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });

    await registerUserController(
      mockRequest as Request,
      mockResponse as Response,
      next,
    );

    expect(next).toHaveBeenCalled();
  });
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

  const mockedExistingUser = {
    _id: new mongoose.Types.ObjectId('123456789123456789123456'),
    email: mockRequest.body.email,
    password: encryptPassword(mockRequest.body.password),
    imageURL: 'image',
    inSession: 'sessionId',
  };

  test('When the password encryption algorithm environment variable does not exist, then an error should be thrown and passed on', async () => {
    delete process.env.PASSWORD_ENCRYPTION_ALGORITHM;

    await loginUserController(
      mockRequest as Request,
      mockResponse as Response,
      next as NextFunction,
    );

    expect(next).toHaveBeenCalled();
  });

  test('When the password encryption key environment variable does not exist, then an error should be thrown and passed on', async () => {
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
      next,
    );

    expect(next).toHaveBeenCalled();
  });

  test('When the jwt secret environment variable does not exist, then an error should be thrown and passed on', async () => {
    delete process.env.JWT_SECRET;

    UserModel.findOne = jest
      .fn()
      .mockImplementation(() => ({ exec: jest.fn().mockResolvedValue(1) }));

    await loginUserController(
      mockRequest as Request,
      mockResponse as Response,
      next,
    );

    expect(next).toHaveBeenCalled();
  });

  test('When the user exists, then it should return the access token', async () => {
    UserModel.findOne = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockedExistingUser),
    });

    await loginUserController(
      mockRequest as Request,
      mockResponse as Response,
      next,
    );

    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith({
      accessToken: generateJWTToken(mockedExistingUser._id.toString()),
      userId: '123456789123456789123456',
    });
  });
});
