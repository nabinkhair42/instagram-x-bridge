import { Request, Response } from 'express';
import { z } from 'zod';
import { sendSuccess, sendError } from '../../utils/api-response';
import llmService from './services';
import logger from '../../utils/logger';
import { MAX_TWEET_LENGTH } from '../../config/llm-prompts';

// Validate request body schema
const summarizeRequestSchema = z.object({
  text: z.string().min(1, "Text cannot be empty"),
  maxLength: z.number().int().min(1).max(1000).optional().default(MAX_TWEET_LENGTH)
});

/**
 * Controller for LLM-related endpoints
 */
export class LLMController {
  /**
   * Summarize a provided text
   */
  async summarizeText(req: Request, res: Response): Promise<Response> {
    try {
      // Log the incoming request
      logger.info(`Received summarize request: ${JSON.stringify(req.body)}`);
      
      // Ensure we have a valid body object and sanitize inputs
      const body = req.body || {};
      const cleanedBody = {
        text: body.text || '',
        maxLength: typeof body.maxLength === 'number' ? body.maxLength : MAX_TWEET_LENGTH 
      };
      
      // Special case for missing text
      if (!cleanedBody.text) {
        return sendError(
          res,
          'Text to summarize is required',
          400,
          'VALIDATION_ERROR'
        );
      }
      
      // Validate request body
      const validationResult = summarizeRequestSchema.safeParse(cleanedBody);
      
      if (!validationResult.success) {
        return sendError(
          res,
          'Invalid request data',
          400,
          'VALIDATION_ERROR',
          validationResult.error.format()
        );
      }
      
      const { text, maxLength } = validationResult.data;
      logger.info(`Processing summarization request for text of length: ${text.length}`);
      
      const result = await llmService.summarizeText({ text, maxLength });
      
      return sendSuccess(res, result);
    } catch (error) {
      logger.error('Error in summarizeText controller', error);
      return sendError(
        res,
        'Failed to summarize text',
        500
      );
    }
  }
}

export default new LLMController();
