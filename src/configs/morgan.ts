import morgan from 'morgan';
import { config } from './config.js';
import { logger } from './logger.js';
import type { Request, Response } from 'express'; // Import the Request and Response types from the express module

morgan.token('message', (req: Request, res: Response) => res.locals.errorMessage || ''); // Add type annotations to req and res

const getIpFormat = (): string => (config.env === 'production' ? ':remote-addr - ' : '');
const successResponseFormat: string = `${getIpFormat()}:method :url :status - :response-time ms`;
const errorResponseFormat: string = `${getIpFormat()}:method :url :status - :response-time ms - message: :message`;

const successHandler = morgan(successResponseFormat, {
  skip: (req: Request, res: Response) => res.statusCode >= 400,
  stream: { write: async (message: string) => await logger.info(message.trim()) },
});

const errorHandler = morgan(errorResponseFormat, {
  skip: (req: Request, res: Response) => res.statusCode < 400,
  stream: { write: async (message: string) => await logger.error(message.trim()) },
});

export const morganHandler = { successHandler, errorHandler };
