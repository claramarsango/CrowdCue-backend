import express from 'express';
import { validate } from 'express-validation';
import {
  loginUserController,
  registerUserController,
} from './auth-controllers.js';
import { loginValidation, registerValidation } from './entry-validation.js';

const authRouter = express.Router();

authRouter
  .route('/register')
  .post(validate(registerValidation), registerUserController);
authRouter.route('/login').post(validate(loginValidation), loginUserController);

export default authRouter;
