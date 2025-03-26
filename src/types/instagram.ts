export interface InstagramPost {
  caption: string;
  imageUrl: string;
  postUrl: string;
  timestamp: string;
  username: string;
}

export interface InstagramFetchOptions {
  username: string;
}

export enum InstagramFetchStrategy {
  WEB_SCRAPING = 'web_scraping',
  GRAPH_API = 'graph_api',
}

export interface InstagramFetchResult {
  success: boolean;
  post?: InstagramPost;
  error?: string;
  strategy: InstagramFetchStrategy;
}
