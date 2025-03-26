import app from './app';
import { env, validateEnv } from './config/env';
import logger from './utils/logger';

// Validate environment variables
validateEnv();

// Create a function that starts the server in development mode
function startDevServer() {
  const PORT = parseInt(env.PORT || '3000', 10);
  
  const server = app.listen(PORT, () => {
    logger.info(`⚡️ Server running on port ${PORT} in ${env.NODE_ENV} mode`);
    logger.info(`Home page: http://localhost:${PORT}`);
    logger.info(`Health check endpoint: http://localhost:${PORT}/health`);
    logger.info(`Instagram API endpoint: http://localhost:${PORT}/api/instagram/latest`);
    logger.info(`Processing endpoint: http://localhost:${PORT}/api/process-instagram`);
  });
  
  // Handle unhandled rejections
  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Rejection:', { reason });
    if (env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  });
  
  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', { error: error.message });
    process.exit(1);
  });
  
  return server;
}

// For local development, start the server
if (process.env.NODE_ENV !== 'production') {
  startDevServer();
}

// Only one default export - conditionally decide what to export
export default app;
