import { TwitterApi } from 'twitter-api-v2';
import axios from 'axios';
import { TWITTER_CONFIG } from '../../config/twitter-settings';
import { MediaUploadResult, TweetRequest, TweetResponse } from '../../types/twitter';
import logger from '../../utils/logger';
import { env } from '../../config/env';
import { REQUEST_HEADERS } from '../../constants/app-config';

/**
 * Twitter Service responsible for posting tweets
 */
export class TwitterService {
  private client: TwitterApi | null = null;
  
  constructor() {
    // Only initialize Twitter client if credentials are available
    if (env.TWITTER_API_KEY && env.TWITTER_API_SECRET && 
        env.TWITTER_ACCESS_TOKEN && env.TWITTER_ACCESS_SECRET) {
      
      try {
        this.client = new TwitterApi({
          appKey: TWITTER_CONFIG.apiKey,
          appSecret: TWITTER_CONFIG.apiSecret,
          accessToken: TWITTER_CONFIG.accessToken,
          accessSecret: TWITTER_CONFIG.accessSecret,
        });
        
        logger.info('Twitter API client initialized successfully');
      } catch (error) {
        logger.error('Failed to initialize Twitter API client', error);
        this.client = null;
      }
    } else {
      logger.warn('Twitter API credentials not provided or incomplete, using mock tweet functionality');
    }
  }
  
  /**
   * Post a tweet with optional media
   */
  async postTweet(tweetRequest: TweetRequest): Promise<TweetResponse> {
    try {
      const { text, imageUrl } = tweetRequest;
      
      // Check if Twitter client is available
      if (!this.client) {
        logger.info(`MOCK TWEET (Twitter API disabled): ${text.substring(0, 30)}...`);
        // Return mock success response
        return {
          success: true,
          tweetId: `mock-${Date.now()}`,
          tweetUrl: `https://twitter.com/mock/status/mock-${Date.now()}`
        };
      }
      
      logger.info(`Preparing to post tweet: ${text.substring(0, 30)}...`);
      
      // Handle image if provided
      let mediaId: string | undefined = undefined;
      
      if (imageUrl) {
        // Skip URLs that are empty or invalid
        if (!imageUrl.trim().startsWith('http')) {
          logger.warn(`Skipping invalid image URL: ${imageUrl}`);
        } else {
          logger.info(`Downloading and uploading image: ${imageUrl}`);
          const mediaUploadResult = await this.uploadMedia(imageUrl);
          
          if (!mediaUploadResult.success) {
            logger.warn(`Failed to upload media: ${mediaUploadResult.error}`);
          } else {
            mediaId = mediaUploadResult.mediaId;
          }
        }
      }
      
      // Post the tweet (text-only if media upload failed)
      try {
        const tweetResult = await this.client.v2.tweet(text, mediaId ? {
          media: { media_ids: [mediaId] }
        } : undefined);
        
        logger.info(`Successfully posted tweet with ID: ${tweetResult.data.id}`);
        
        return {
          success: true,
          tweetId: tweetResult.data.id,
          tweetUrl: `https://twitter.com/user/status/${tweetResult.data.id}`
        };
      } catch (tweetError: any) {
        // Check for specific permission errors
        if (tweetError?.data?.detail?.includes('oauth1 app permissions')) {
          logger.error('Twitter API permission error - make sure your app has Read and Write permissions', {
            error: tweetError?.data?.detail
          });
          
          return {
            success: false,
            error: 'Your Twitter app needs Read and Write permissions. Please update your app in the Twitter Developer Portal.'
          };
        }
        
        throw tweetError; // Re-throw for general error handling
      }
    } catch (error) {
      logger.error('Error posting tweet', error);
      return {
        success: false,
        error: error instanceof Error 
          ? `${error.message} - Check Twitter Developer Portal app settings and ensure you have Read and Write permissions.` 
          : 'Unknown error posting tweet'
      };
    }
  }
  
  /**
   * Upload media from URL
   */
  private async uploadMedia(url: string): Promise<MediaUploadResult> {
    try {
      // Ensure client is available
      if (!this.client) {
        return {
          success: false,
          error: 'Twitter client not initialized'
        };
      }
      
      // Validate URL before attempting to download
      if (!url.trim().startsWith('http')) {
        return {
          success: false,
          error: 'Invalid image URL'
        };
      }

      // Download the image with proper headers
      try {
        const response = await axios.get(url, {
          responseType: 'arraybuffer',
          headers: {
            ...REQUEST_HEADERS.BROWSER,
            'Referer': 'https://twitter.com/'
          },
          timeout: 10000 // 10 second timeout
        });
        
        // Check if content type is supported
        const contentType = response.headers['content-type'];
        if (!TWITTER_CONFIG.ALLOWED_MEDIA_TYPES.includes(contentType)) {
          return {
            success: false,
            error: `Unsupported media type: ${contentType}`
          };
        }
        
        // Upload to Twitter
        try {
          const mediaClient = this.client.readWrite;
          const mediaId = await mediaClient.v1.uploadMedia(response.data, { mimeType: contentType });
          
          return {
            success: true,
            mediaId
          };
        } catch (uploadError: any) {
          // Check for specific permission errors
          if (uploadError?.code === 403) {
            logger.error('Media upload permission error - make sure your app has Read and Write permissions');
            return {
              success: false,
              error: 'Twitter media upload requires Read and Write permissions'
            };
          }
          
          throw uploadError; // Re-throw for general error handling
        }
      } catch (downloadError) {
        logger.error(`Failed to download image from URL: ${url}`, downloadError);
        return {
          success: false,
          error: 'Failed to download image - the URL may be inaccessible or invalid'
        };
      }
    } catch (error) {
      logger.error('Error uploading media', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error uploading media'
      };
    }
  }
}

export default new TwitterService();
