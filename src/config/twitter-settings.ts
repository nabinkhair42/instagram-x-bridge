import { env } from './env';

export const TWITTER_CONFIG = {
  apiKey: env.TWITTER_API_KEY,
  apiSecret: env.TWITTER_API_SECRET,
  accessToken: env.TWITTER_ACCESS_TOKEN,
  accessSecret: env.TWITTER_ACCESS_SECRET,
  
  // Rate limits and configuration
  MAX_TWEETS_PER_HOUR: 300,
  MAX_MEDIA_SIZE_MB: 5,
  ALLOWED_MEDIA_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
  
  // Retry configuration
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 2000,
};
