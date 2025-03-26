import instagramService from '../instagram/services';
import llmService from '../llm/services';
import twitterService from '../twitter/services';
import logger from '../../utils/logger';
import { InstagramPost } from '../../types/instagram';
import { TweetResponse } from '../../types/twitter';

interface ProcessWorkflowOptions {
  instagramUsername?: string;
  includeImage?: boolean;
}

interface ProcessWorkflowResult {
  success: boolean;
  instagramPost?: InstagramPost;
  summary?: string;
  tweet?: TweetResponse;
  error?: string;
  stage?: string; // Which stage failed
}

/**
 * Workflow Service responsible for orchestrating the complete process
 */
export class WorkflowService {
  /**
   * Process the complete Instagram to Twitter workflow
   */
  async processWorkflow(options?: ProcessWorkflowOptions): Promise<ProcessWorkflowResult> {
    try {
      logger.info('Starting Instagram to X.com workflow', { options });
      
      // Step 1: Fetch Instagram post
      const instagramResult = await instagramService.getLatestPost({
        username: options?.instagramUsername
      });
      
      if (!instagramResult.success || !instagramResult.post) {
        return {
          success: false,
          error: `Failed to fetch Instagram post: ${instagramResult.error}`,
          stage: 'instagram_fetch'
        };
      }
      
      const post = instagramResult.post;
      logger.info(`Successfully fetched Instagram post from ${post.username}`);
      
      // Step 2: Summarize the caption
      const summarizationResult = await llmService.summarizeText({
        text: post.caption
      });
      
      const summary = summarizationResult.summary;
      logger.info(`Successfully summarized caption (${post.caption.length} chars to ${summary.length} chars)`);
      
      // Step 3: Post to Twitter
      // Only include image if explicitly requested (to avoid Twitter API issues)
      // Default to false for now due to the 403 errors we're seeing
      const includeImage = options?.includeImage === true ? true : false;
      
      const tweetResult = await twitterService.postTweet({
        text: summary,
        ...(includeImage ? { imageUrl: post.imageUrl } : {})
      });
      
      if (!tweetResult.success) {
        return {
          success: false,
          instagramPost: post,
          summary,
          error: `Failed to post tweet: ${tweetResult.error}`,
          stage: 'twitter_post'
        };
      }
      
      logger.info(`Successfully posted tweet with ID: ${tweetResult.tweetId}`);
      
      return {
        success: true,
        instagramPost: post,
        summary,
        tweet: tweetResult
      };
    } catch (error) {
      logger.error('Error processing workflow', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error in workflow',
        stage: 'workflow_exception'
      };
    }
  }
}

export default new WorkflowService();
