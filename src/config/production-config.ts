/**
 * Special configuration for production environment
 */
import { env } from './env';

export const PRODUCTION_CONFIG = {
  // Increase timeouts for serverless environments
  SCRAPING_TIMEOUT: 15000,
  
  // Additional headers to mimic legitimate browsers better
  ADDITIONAL_HEADERS: {
    'Accept-Language': 'en-US,en;q=0.9',
    'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'Referer': 'https://www.google.com/',
  },
  
  // Fallback settings
  FALLBACK_SETTINGS: {
    // Whether to use enhanced fallbacks (pre-recorded real posts)
    USE_ENHANCED_FALLBACKS: true,
    // How long to cache successful responses (in milliseconds)
    CACHE_DURATION: 3600000, // 1 hour
  }
};
