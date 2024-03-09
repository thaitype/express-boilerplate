import httpStatus from 'http-status';
import { config } from '../configs/config.js';
import { logger } from '../configs/logger.js';
import { ApiError } from '../utils/ApiError.js';
import type { Request, Response, NextFunction } from 'express';

const errorConverter = (err: any, req: Request, res: Response, next: NextFunction): void => {
  let error = err;
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR;
    const message = error.message || httpStatus[statusCode];
    error = new ApiError(statusCode, message, false, err.stack);
  }
  next(error);
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (!(err instanceof ApiError)) {
    logger.error(err);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      code: httpStatus.INTERNAL_SERVER_ERROR,
      message: 'Error handler type is not ApiError. Please check the error handler.',
    });
  }
  let { statusCode, message } = err;
  console.log('statusCode', statusCode, message);
  if (config.env === 'production' && !err.isOperational) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR];
  }

  const response = {
    code: statusCode,
    message,
    ...(config.env === 'development' && { stack: err.stack }),
  };

  if (config.env === 'development') {
    logger.error(err);
  }

  return res.status(statusCode).send(response);
};

export { errorConverter, errorHandler };
