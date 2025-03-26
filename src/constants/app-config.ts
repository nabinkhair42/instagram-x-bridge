/**
 * Application-wide configuration constants
 */
export const APP_CONFIG = {
  VERSION: '1.0.0',
  NAME: 'Instagram to X.com Bridge',
  DESCRIPTION: 'Service to fetch Instagram posts, summarize content, and post to X.com',
  AUTHOR: 'Your Name',
  REPOSITORY: 'https://github.com/nabinkhiar42/instagram-x-bridge',
  MAX_RETRIES: 3,
  DEFAULT_TIMEOUT: 10000,
  DEBUG_MODE: process.env.NODE_ENV === 'development',
  INSTAGRAM_APP_ID: '936619743392459', // Instagram web app ID for API requests
};

/**
 * User-Agent strings for HTTP requests - updated with the latest browser versions
 * Multiple options to rotate and avoid detection
 */
export const USER_AGENTS = [
  // Chrome on Windows
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  // Edge on Windows
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0',
  // Firefox on Windows
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0',
  // Safari on macOS
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
  // Chrome on macOS
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  // Mobile Chrome on iPhone
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/124.0.6327.109 Mobile/15E148 Safari/604.1',
  // Mobile Chrome on Android
  'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.6327.109 Mobile Safari/537.36',
];

/**
 * Request headers for different scenarios
 */
export const REQUEST_HEADERS = {
  // Standard web browser headers
  BROWSER: {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate, br',
    'DNT': '1',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Cache-Control': 'max-age=0',
  },
  
  // Headers for JSON/API requests
  API: {
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.5',
    'X-Requested-With': 'XMLHttpRequest',
    'Content-Type': 'application/json',
    'Origin': 'https://www.instagram.com',
    'Connection': 'keep-alive',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
    'Pragma': 'no-cache',
    'Cache-Control': 'no-cache',
  }
};
