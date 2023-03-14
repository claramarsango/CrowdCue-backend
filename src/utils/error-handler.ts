import { NextFunction, Request, Response } from 'express';
import { ValidationError } from 'express-validation';
import { Error } from 'mongoose';

const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof ValidationError) {
    return res.status(err.statusCode).json(err);
  }

  return res.status(500).json(err);
};

export default errorHandler;
