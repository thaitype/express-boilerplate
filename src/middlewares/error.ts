import httpStatus from 'http-status';
import { config } from '../configs/config.js';
import { logger } from '../configs/logger.js';
import { ApiError } from '../utils/ApiError.js';
import type { Request, Response, NextFunction } from 'express';

const errorConverter = (err: any, req: Request, res: Response, next: NextFunction): void => {
  
  let error = err;
  console.log('xxxx', typeof error, error.message, error.stack, error.statusCode, error.isOperational);
//   if(!(error instanceof Error)) {
//     const message = String(error);
//     error = new ApiError(httpStatus.INTERNAL_SERVER_ERROR, message, false, undefined);
//     return  next(error);
//   }
  if (!(error instanceof ApiError)) {


    const statusCode =
      error.statusCode ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR;
    const message = error.message || httpStatus[statusCode];
    error = new ApiError(statusCode, message, false, err.stack);
  }
  next(error);
};

const errorHandler = (err: any, req: Request, res: Response): void => {
  let { statusCode, message } = err;
  if (config.env === 'production' && !err.isOperational) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR];
  }

  res.locals.errorMessage = err.message;

  const response = {
    code: statusCode,
    message,
    ...(config.env === 'development' && { stack: err.stack }),
  };

  if (config.env === 'development') {
    logger.error(err);
  }

  res.status(statusCode).send(response);
};

export { errorConverter, errorHandler };
