import express from 'express';
import { config } from './configs/config.js';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { morganHandler } from './configs/morgan.js';
import routes from './routes/index.js';
import { ApiError } from './utils/ApiError.js';
import httpStatus from 'http-status';
import { errorConverter, errorHandler } from './middlewares/error.js';

const app = express();

if (config.env !== 'test') {
  app.use(morganHandler.successHandler);
  app.use(morganHandler.errorHandler);
}

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// gzip compression
app.use(compression());

// enable cors
app.use(cors());
app.options('*', cors());

// v1 api routes
app.use('/api', routes);

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

export default app;
