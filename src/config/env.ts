import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

// Define the environment schema with validation
const envSchema = z.object({
  // Server
  PORT: z.string().default("3000"),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Instagram
  INSTAGRAM_USERNAME: z.string().default('bbcnews'),
  INSTAGRAM_SCRAPING_RETRIES: z.coerce.number().int().min(1).max(10).default(3),
  INSTAGRAM_RETRY_DELAY: z.coerce.number().int().min(500).max(5000).default(1500),
  
  // LLM
  LLM_API_KEY: z.string().optional().default(''), // Made optional for development without API key
  LLM_MODEL: z.string().default('gpt-3.5-turbo'),
  LLM_TEMPERATURE: z.coerce.number().min(0).max(1).default(0.7),
  
  // Twitter/X.com
  TWITTER_API_KEY: z.string().optional().default(''), // Made optional for development without API key
  TWITTER_API_SECRET: z.string().optional().default(''),
  TWITTER_ACCESS_TOKEN: z.string().optional().default(''),
  TWITTER_ACCESS_SECRET: z.string().optional().default(''),
});

// Extract and validate environment variables
export const env = envSchema.parse(process.env);

// Optional: Define a function to check if all required env vars are set
export const validateEnv = (): boolean => {
  try {
    envSchema.parse(process.env);
    return true;
  } catch (error) {
    console.error('❌ Invalid environment variables:', error);
    return false;
  }
};
