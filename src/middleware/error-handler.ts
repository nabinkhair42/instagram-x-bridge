import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/api-response';
import logger from '../utils/logger';
import { env } from '../config/env';

/**
 * Global error handler middleware
 */
export function errorHandler(
  err: Error, 
  req: Request, 
  res: Response, 
  next: NextFunction
) {
  // Log the error
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // Don't expose error details in production
  const errorMessage = env.NODE_ENV === 'production' 
    ? 'An unexpected error occurred' 
    : err.message;

  // Send error response
  return sendError(
    res,
    errorMessage,
    500,
    'INTERNAL_SERVER_ERROR',
    env.NODE_ENV !== 'production' ? err.stack : undefined
  );
}

export default errorHandler;
