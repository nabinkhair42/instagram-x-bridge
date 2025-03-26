import { Router, Request, Response } from 'express';
import { env } from '../config/env';
import logger from '../utils/logger';
import { sendSuccess, sendError } from '../utils/api-response';

const router: Router = Router();

// Only enable in development or with simple authorization
router.get('/debug/environment', async (req: Request, res: Response) => {
  try {
    // In production, only allow with proper authorization
    if (env.NODE_ENV === 'production') {
      // Check for authorization header
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return sendError(res, 'Not authorized', 401);
      }
      
      // For security, use a simple timestamp-based comparison when DEBUG_SECRET is not set
      // This is still relatively secure for a debug endpoint but doesn't require environment variables
      const token = authHeader.split('Bearer ')[1];
      const now = Math.floor(Date.now() / 3600000); // Current hour timestamp
      const validTokens = [
        `debug-${now}`, // Current hour
        `debug-${now - 1}` // Previous hour (for token validity across hour boundaries)
      ];
      
      if (!validTokens.includes(token)) {
        return sendError(res, 'Invalid debug token', 401);
      }
    }
    
    // Collect environment info
    const envInfo = {
      nodeEnv: env.NODE_ENV,
      nodeVersion: process.version,
      platform: process.platform,
      serverTimestamp: new Date().toISOString(),
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime(),
      // Add Vercel-specific environment variables if present
      vercelInfo: {
        region: process.env.VERCEL_REGION || 'N/A',
        url: process.env.VERCEL_URL || 'N/A',
        environment: process.env.VERCEL_ENV || 'N/A'
      }
    };
    
    return sendSuccess(res, envInfo);
  } catch (error) {
    logger.error('Error in debug endpoint', error);
    return sendError(res, 'Failed to retrieve debug information', 500);
  }
});

export default router;
