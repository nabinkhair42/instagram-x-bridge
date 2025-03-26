import { Request, Response, Router } from 'express';
import path from 'path';
import fs from 'fs';
import { env } from '../config/env';
import logger from '../utils/logger';

const router: Router = Router();

/**
 * API Documentation HTML template
 */
const getDocumentationHtml = () => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Instagram to X.com Bridge API</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1000px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 {
      color: #1da1f2;
      border-bottom: 1px solid #eee;
      padding-bottom: 10px;
    }
    h2 {
      margin-top: 30px;
      color: #14171a;
    }
    .endpoint {
      background-color: #f8f9fa;
      border-left: 4px solid #1da1f2;
      padding: 15px;
      margin: 20px 0;
      border-radius: 3px;
    }
    .method {
      display: inline-block;
      padding: 5px 10px;
      border-radius: 3px;
      font-weight: bold;
      margin-right: 10px;
    }
    .get { background-color: #61affe; color: white; }
    .post { background-color: #49cc90; color: white; }
    pre {
      background-color: #f1f1f1;
      padding: 15px;
      border-radius: 3px;
      overflow-x: auto;
    }
    code {
      font-family: Consolas, Monaco, 'Andale Mono', monospace;
    }
    .status {
      display: flex;
      align-items: center;
      margin-bottom: 30px;
    }
    .status-indicator {
      height: 20px;
      width: 20px;
      border-radius: 50%;
      margin-right: 10px;
    }
    .status-online {
      background-color: #49cc90;
    }
    .status-offline {
      background-color: #f93e3e;
    }
    .footer {
      margin-top: 50px;
      text-align: center;
      color: #657786;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <h1>Instagram to X.com Bridge API</h1>
  
  <div class="status">
    <div class="status-indicator status-online"></div>
    <div>API Status: Online | Environment: ${env.NODE_ENV}</div>
  </div>
  
  <p>
    This API service fetches the latest post from Instagram, summarizes its caption using 
    an LLM, and can post the summarized content to X.com (Twitter).
  </p>
  
  <h2>Endpoints</h2>
  
  <div class="endpoint">
    <span class="method get">GET</span>
    <strong>/api/instagram/latest</strong>
    <p>Fetches the latest post from the configured Instagram account.</p>
    <p><strong>Query Parameters:</strong></p>
    <ul>
      <li><code>username</code> - (optional) Override the default Instagram username</li>
    </ul>
  </div>
  
  <div class="endpoint">
    <span class="method post">POST</span>
    <strong>/api/summarize</strong>
    <p>Summarizes a provided text using the configured LLM.</p>
    <p><strong>Request Body:</strong></p>
    <pre><code>{
  "text": "Text to be summarized",
  "maxLength": 280
}</code></pre>
  </div>
  
  <div class="endpoint">
    <span class="method post">POST</span>
    <strong>/api/tweet</strong>
    <p>Posts a tweet to X.com.</p>
    <p><strong>Request Body:</strong></p>
    <pre><code>{
  "text": "Text to tweet",
  "imageUrl": "https://example.com/actual-image-url.jpg"  // Optional - omit this field if not using an image
}</code></pre>
  </div>
  
  <div class="endpoint">
    <span class="method post">POST</span>
    <strong>/api/process-instagram</strong>
    <p>Triggers the entire workflow: fetch Instagram post, summarize, and post to X.com.</p>
    <p><strong>Request Body:</strong></p>
    <pre><code>{
  "instagramUsername": "bbcnews",  // Optional - uses default if omitted
  "includeImage": false  // Optional - defaults to false to avoid Twitter API issues
}</code></pre>
  </div>
  
  <h2>Try It</h2>
  <p>
    You can test the API using curl or any API client:
  </p>
  <pre><code>curl -X GET "${getBaseUrl()}/api/instagram/latest"</code></pre>
  
  <div class="footer">
    <p>Instagram to X.com Bridge API | Version 1.0.0</p>
    <p>⚡ Powered by Node.js, Express, and TypeScript</p>
  </div>
</body>
</html>
`;

/**
 * Get the base URL for the API
 */
function getBaseUrl(): string {
  const host = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : `http://localhost:${env.PORT}`;
  return host;
}

/**
 * Root route handler - serves API documentation
 */
router.get('/', (req: Request, res: Response) => {
  try {
    // Serve HTML documentation
    const html = getDocumentationHtml();
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    logger.error('Error serving home page', error);
    res.status(500).send('Error loading documentation');
  }
});

/**
 * Health check endpoint
 */
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    version: '1.0.0'
  });
});

export default router;
