import winston from 'winston';
import { env } from '../config/env';

// Add http level for morgan integration
const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
  }
};

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  env.NODE_ENV === 'production'
    ? winston.format.json()
    : winston.format.printf(({ level, message, timestamp, ...meta }) => {
        return `${timestamp} ${level}: ${message} ${
          Object.keys(meta).length ? JSON.stringify(meta) : ''
        }`;
      })
);

// Create transports based on environment
const transports: winston.transport[] = [
  // Console transport is always used
  new winston.transports.Console({
    stderrLevels: ['error'],
  })
];

// Only add file transports in non-serverless environments
if (env.NODE_ENV !== 'production' || process.env.IS_LOCAL_ENV === 'true') {
  transports.push(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    })
  );
}

// Create the logger with custom levels
const logger = winston.createLogger({
  levels: customLevels.levels,
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  transports,
  // Don't exit on uncaught exceptions in serverless environment
  exitOnError: env.NODE_ENV !== 'production'
});

// Add colors
winston.addColors(customLevels.colors);

// Create a stream object for Morgan to use
const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  }
};

export { stream };
export default logger;
