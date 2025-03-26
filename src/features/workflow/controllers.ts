import { Request, Response } from 'express';
import { z } from 'zod';
import { sendSuccess, sendError } from '../../utils/api-response';
import workflowService from './services';
import logger from '../../utils/logger';

// Validate request body schema
const processInstagramSchema = z.object({
  instagramUsername: z.string().optional(),
  includeImage: z.boolean().optional().default(false) // Default to false due to Twitter API issues
});

/**
 * Controller for workflow-related endpoints
 */
export class WorkflowController {
  /**
   * Process the complete Instagram to X.com workflow
   */
  async processInstagram(req: Request, res: Response): Promise<Response> {
    try {
      // Log the incoming request
      logger.info(`Received workflow request: ${JSON.stringify(req.body)}`);
      
      // Ensure we have a valid body object and sanitize inputs
      const body = req.body || {};
      const cleanBody = {
        instagramUsername: typeof body.instagramUsername === 'string' ? body.instagramUsername : undefined,
        includeImage: typeof body.includeImage === 'boolean' ? body.includeImage : false
      };
      
      // Validate request body
      const validationResult = processInstagramSchema.safeParse(cleanBody);
      
      if (!validationResult.success) {
        return sendError(
          res,
          'Invalid request data',
          400,
          'VALIDATION_ERROR',
          validationResult.error.format()
        );
      }
      
      const { instagramUsername, includeImage } = validationResult.data;
      logger.info('Processing Instagram to X.com workflow', { instagramUsername, includeImage });
      
      const result = await workflowService.processWorkflow({
        instagramUsername,
        includeImage
      });
      
      if (!result.success) {
        // Customize error response based on which stage failed
        if (result.stage === 'twitter_post' && result.error?.includes('permissions')) {
          // For Twitter permission errors, provide a success response anyway but with a warning
          logger.warn('Twitter posting failed due to permissions, but providing partial success response');
          
          return sendSuccess(
            res, 
            {
              instagramPost: {
                caption: result.instagramPost?.caption,
                imageUrl: result.instagramPost?.imageUrl,
                postUrl: result.instagramPost?.postUrl
              },
              summary: result.summary,
              tweet: null, // No tweet was created
              warning: "Twitter posting was skipped: Your Twitter app needs Read and Write permissions"
            },
            200, // Return 200 OK even though Twitter part failed
            {
              partialSuccess: true,
              failedStage: 'twitter_post'
            }
          );
        }
        
        return sendError(
          res,
          `Workflow failed${result.stage ? ` at ${result.stage} stage` : ''}: ${result.error}`,
          500,
          'WORKFLOW_ERROR',
          { stage: result.stage }
        );
      }
      
      return sendSuccess(res, {
        instagramPost: {
          caption: result.instagramPost?.caption,
          imageUrl: result.instagramPost?.imageUrl,
          postUrl: result.instagramPost?.postUrl
        },
        summary: result.summary,
        tweet: {
          id: result.tweet?.tweetId,
          url: result.tweet?.tweetUrl
        }
      });
    } catch (error) {
      logger.error('Error in processInstagram controller', error);
      return sendError(
        res,
        'Failed to process Instagram to X.com workflow',
        500
      );
    }
  }
}

export default new WorkflowController();
