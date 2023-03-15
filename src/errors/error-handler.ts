import { NextFunction, Request, Response } from 'express';
import { ValidationError } from 'express-validation';
import { Error } from 'mongoose';
import { CustomHttpError } from './custom-http-error';

const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof ValidationError) {
    return res
      .status(err.statusCode)
      .json({ msg: err.details.body?.[0].message ?? err.message });
  }

  if (err instanceof CustomHttpError) {
    return res.status(err.httpCode).json(err.jsonBodyResponse());
  }

  return res.status(500).json(err);
};

export default errorHandler;
