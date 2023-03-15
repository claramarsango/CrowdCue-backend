import { RequestHandler } from 'express';
import { CustomHttpError } from '../../errors/custom-http-error.js';
import { AuthRequest, LoginResponse } from '../../types/auth-types.js';
import { UserModel } from '../users/user-model.js';
import { encryptPassword, generateJWTToken } from './auth-utils.js';

export const loginUserController: RequestHandler<
  unknown,
  LoginResponse | { message: string },
  AuthRequest
> = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const filterUser = {
      email,
      password: encryptPassword(password),
    };

    const existingUser = await UserModel.findOne(filterUser).exec();

    if (existingUser === null) {
      throw new CustomHttpError(
        404,
        'There is no registered user with this email and password',
      );
    }

    const userToken = generateJWTToken(email);

    res.status(201).json({ accessToken: userToken });
  } catch (error) {
    next(error);
  }
};
