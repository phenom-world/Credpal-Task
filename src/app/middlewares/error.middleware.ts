import { Handler, NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Error as MongooseError } from 'mongoose';

import config from '../../config';

interface MongoServerError extends Error {
  code: number;
  keyValue: Record<string, unknown>;
}

class ErrorHandler {
  static notFound: Handler = (req: Request, res: Response, next: NextFunction) => {
    const error = new Error(`Route not found ${req.originalUrl}`);
    res.status(StatusCodes.NOT_FOUND);
    next(error);
  };

  static handleError(err: Error, _req: Request, res: Response, _next: NextFunction): void {
    const statusCode = res.statusCode === StatusCodes.OK ? StatusCodes.INTERNAL_SERVER_ERROR : res.statusCode;
    const stack = config.application.get('env') === 'production' ? null : err.stack;

    // handles mongo validation errors
    if (err instanceof MongooseError.ValidationError) {
      const errors = Object.values(err.errors).map((error) => error.message);
      err.message = errors.join(', ');
      res.status(StatusCodes.BAD_REQUEST);

      // handles mongo cast errors
    } else if (err instanceof MongooseError.CastError) {
      err.message = `Invalid ${err.path}: ${err.value}`;
      res.status(StatusCodes.BAD_REQUEST);

      // handles mongo duplicate field errors
    } else if (err.name === 'MongoServerError') {
      const mongoError = err as MongoServerError;
      if (mongoError.code === 11000) {
        const dupField = Object.keys(mongoError.keyValue)[0];
        err.message = `${dupField}: ${mongoError.keyValue[dupField]} already exists in the database!`;
        res.status(StatusCodes.CONFLICT);
      }
    }

    switch (err.name) {
      case 'BadRequestError':
        res.status(StatusCodes.BAD_REQUEST);
        break;
      case 'UnauthorizedError':
        res.status(StatusCodes.UNAUTHORIZED);
        break;
      case 'ForbiddenError':
        res.status(StatusCodes.FORBIDDEN);
        break;
      case 'NotFoundError':
        res.status(StatusCodes.NOT_FOUND);
        break;
      default:
        res.status(statusCode);
    }

    res.json({
      message: err.message || err,
      stack,
      success: false,
    });
  }
}

export const notFound = ErrorHandler.notFound;
export const ErrorMiddleware = ErrorHandler.handleError;
