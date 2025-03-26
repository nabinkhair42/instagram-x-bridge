import { Request, Response } from 'express';
import { z } from 'zod';
import { sendSuccess, sendError } from '../../utils/api-response';
import twitterService from './services';
import logger from '../../utils/logger';

// Validate request body schema with more flexible URL validation
const tweetRequestSchema = z.object({
  text: z.string().min(1).max(280, "Tweet exceeds maximum length of 280 characters"),
  imageUrl: z.union([
    z.string().url(),
    z.string().length(0),
    z.undefined(),
    z.null()
  ]).optional().transform(val => val === null ? undefined : val) // Transform null to undefined
});

/**
 * Controller for Twitter-related endpoints
 */
export class TwitterController {
  /**
   * Post a tweet with optional media
   */
  async postTweet(req: Request, res: Response): Promise<Response> {
    try {
      const body = req.body || {};
      logger.info(`Received tweet request: ${JSON.stringify(body)}`);
      
      // Clean up the request body - ensure we don't pass null values
      const cleanBody = {
        text: body.text || '',
        // Filter out null, undefined, or placeholder text and ensure we only return string or undefined
        ...(this.getValidImageUrl(body.imageUrl))
      };
      
      // Validate request body
      const validationResult = tweetRequestSchema.safeParse(cleanBody);
      
      if (!validationResult.success) {
        return sendError(
          res,
          'Invalid request data',
          400,
          'VALIDATION_ERROR',
          validationResult.error.format()
        );
      }
      
      const { text, imageUrl } = validationResult.data;
      logger.info(`Processing request to post tweet: ${text.substring(0, 30)}...`);
      
      const result = await twitterService.postTweet({ text, imageUrl });
      
      if (!result.success) {
        // Check for common permission errors
        if (result.error?.includes('permissions')) {
          return sendError(
            res,
            result.error,
            403, // Forbidden
            'TWITTER_PERMISSIONS_ERROR',
            {
              helpText: "Update your app in Twitter Developer Portal to have Read and Write permissions"
            }
          );
        }
        
        return sendError(
          res,
          `Failed to post tweet: ${result.error}`,
          500
        );
      }
      
      return sendSuccess(res, {
        tweetId: result.tweetId,
        tweetUrl: result.tweetUrl
      });
    } catch (error) {
      logger.error('Error in postTweet controller', error);
      return sendError(
        res,
        'Failed to post tweet',
        500
      );
    }
  }

  /**
   * Get a valid image URL if it exists, otherwise return an empty object
   * This ensures we only return undefined or a valid string URL
   */
  private getValidImageUrl(url: any): { imageUrl?: string } {
    // If the URL isn't valid, return an empty object (no imageUrl property)
    if (!this.isValidImageUrl(url)) {
      return {};
    }
    
    // Otherwise return a valid string URL
    return { imageUrl: url };
  }

  /**
   * Check if an image URL is valid and not a placeholder
   */
  private isValidImageUrl(url: any): url is string {
    // Return false for empty, null, undefined values
    if (url === null || url === undefined) return false;
    
    // Return false if it's not a string
    if (typeof url !== 'string') return false;
    
    // Trim the URL
    const trimmedUrl = url.trim();
    
    // Return false for empty strings after trimming
    if (trimmedUrl === '') return false;
    
    // List of placeholder indicators
    const placeholders = [
      'optional image',
      'placeholder',
      'example',
      'sample',
      'attach',
      'choose',
      'select'
    ];
    
    // Check if the URL contains any placeholder text (case insensitive)
    const lowerUrl = trimmedUrl.toLowerCase();
    if (placeholders.some(p => lowerUrl.includes(p))) {
      return false;
    }
    
    // Basic URL validation - must start with http:// or https://
    return /^https?:\/\//i.test(trimmedUrl);
  }
}

export default new TwitterController();
