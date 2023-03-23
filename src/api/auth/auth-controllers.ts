import { RequestHandler } from 'express';
import { CustomHttpError } from '../../errors/custom-http-error.js';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
} from '../../types/auth-types.js';
import { UserModel } from '../users/user-model.js';
import { encryptPassword, generateJWTToken } from './auth-utils.js';

export const registerUserController: RequestHandler<
  unknown,
  unknown,
  RegisterRequest
> = async (req, res, next) => {
  const { email, password, confirmedPassword } = req.body;

  try {
    const existingUser = await UserModel.findOne({ email }).exec();

    if (existingUser !== null) {
      throw new CustomHttpError(
        409,
        'An account with that email already exists',
      );
    }

    if (password !== confirmedPassword) {
      throw new CustomHttpError(403, 'Passwords must match');
    }

    const newUser = {
      email,
      password: encryptPassword(password),
      username: email.split('@')[0],
      imageURL: '',
      inSession: '',
    };

    await UserModel.create(newUser);

    return res.status(201).json({ msg: 'User registered successfully!' });
  } catch (error) {
    next(error);
  }
};

export const loginUserController: RequestHandler<
  unknown,
  LoginResponse | { message: string },
  LoginRequest
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

    const userToken = generateJWTToken(existingUser._id.toString());

    res.status(201).json({ accessToken: userToken });
  } catch (error) {
    next(error);
  }
};
