import express from 'express';
import { validate } from 'express-validation';
import {
  loginUserController,
  registerUserController,
} from './auth-controllers.js';
import { entryValidation } from './entry-validation.js';

const authRouter = express.Router();

authRouter.use(validate(entryValidation));

authRouter.route('/register').post(registerUserController);
authRouter.route('/login').post(loginUserController);

export default authRouter;
