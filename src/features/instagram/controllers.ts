import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../../utils/api-response';
import instagramService from './services';
import logger from '../../utils/logger';

/**
 * Controller for Instagram-related endpoints
 */
export class InstagramController {
  /**
   * Get the latest post from Instagram
   */
  async getLatestPost(req: Request, res: Response): Promise<Response> {
    try {
      // Extract username from query params or use default
      const username = req.query.username as string | undefined;
      
      logger.info(`Processing request to fetch latest post${username ? ` for ${username}` : ''}`);
      
      const result = await instagramService.getLatestPost({ username });
      
      if (!result.success) {
        return sendError(
          res, 
          `Failed to fetch Instagram post: ${result.error}`, 
          500
        );
      }
      
      return sendSuccess(res, result.post, 200, {
        strategy: result.strategy,
      });
    } catch (error) {
      logger.error('Error in getLatestPost controller', error);
      return sendError(
        res,
        'Failed to retrieve Instagram post',
        500
      );
    }
  }
}

export default new InstagramController();
