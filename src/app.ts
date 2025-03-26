import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import apiRouter from './routes';
import homeRouter from './routes/home';
import errorHandler from './middleware/error-handler';
import { stream } from './utils/logger';

// Create Express application
const app: Express = express();

// Apply middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// Request logging
if (env.NODE_ENV !== 'test') {
  app.use(morgan('combined', { stream }));
}

// Home and documentation routes
app.use('/', homeRouter);

// API routes
app.use('/api', apiRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Resource not found',
      code: 'NOT_FOUND'
    },
    meta: {
      timestamp: new Date().toISOString(),
      path: req.path
    }
  });
});

// Global error handler
app.use(errorHandler);

export default app;
