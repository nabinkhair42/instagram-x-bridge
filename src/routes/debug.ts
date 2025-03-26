import { Router, Request, Response } from 'express';
import { env } from '../config/env';
import logger from '../utils/logger';
import { sendSuccess, sendError } from '../utils/api-response';

const router: Router = Router();

// Only enable in development or with special token
router.get('/debug/environment', async (req: Request, res: Response) => {
  try {
    // Check if this is allowed
    const authToken = req.headers.authorization?.split('Bearer ')[1];
    
    if (env.NODE_ENV === 'production' && authToken !== process.env.DEBUG_SECRET) {
      return sendError(res, 'Not authorized', 401);
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
