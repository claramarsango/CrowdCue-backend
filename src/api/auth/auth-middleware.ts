import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { CustomHttpError } from '../../errors/custom-http-error.js';

export const authMiddleware: RequestHandler = (req, res, next) => {
  const jwtToken = req.headers.authorization?.split(' ')[1];
  if (!jwtToken) {
    throw new CustomHttpError(401, 'Unauthorized');
  }

  if (!process.env.JWT_SECRET) {
    throw new CustomHttpError(
      500,
      'JWT_SECRET environment variable is not defined',
    );
  }

  const payload = jwt.verify(
    jwtToken,
    process.env.JWT_SECRET,
  ) as jwt.JwtPayload;

  res.locals.id = payload.id;
  next();
};
