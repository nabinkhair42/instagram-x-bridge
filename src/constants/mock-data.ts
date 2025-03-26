import { InstagramPost } from '../types/instagram';

/**
 * Mock Instagram posts by username
 * Used as fallback when Instagram scraping fails
 */
export const MOCK_INSTAGRAM_POSTS: Record<string, InstagramPost> = {
  // BBC News
  bbcnews: {
    caption: "BREAKING: Major climate agreement reached at COP summit. World leaders commit to new emissions targets by 2030. Our correspondents are reporting live from the conference with exclusive interviews and analysis. Follow our coverage for the latest updates on this historic agreement. #ClimateAction #BBCNews",
    imageUrl: "https://images.unsplash.com/photo-1569038786784-24a715a36eda?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    postUrl: "https://www.instagram.com/bbcnews/",
    timestamp: new Date().toISOString(),
    username: "bbcnews"
  },
  
  // CNN
  cnn: {
    caption: "Just In: Economic data shows stronger than expected growth in Q1. Market analysts are revising forecasts following today's surprise announcement. Unemployment reaches lowest level in 50 years. Read more on our website - link in bio. #EconomicNews #CNN",
    imageUrl: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    postUrl: "https://www.instagram.com/cnn/",
    timestamp: new Date().toISOString(),
    username: "cnn"
  },
  
  // National Geographic
  natgeo: {
    caption: "Extraordinary photo captured by our photographer shows rare snow leopard in the Himalayas. These elusive cats are increasingly threatened by climate change and habitat loss. Our conservation team has been tracking this individual for 3 months. Swipe to see behind-the-scenes of this challenging expedition. #SaveTheSnowLeopard #NatGeo",
    imageUrl: "https://images.unsplash.com/photo-1602491453631-e2a5ad90a131?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    postUrl: "https://www.instagram.com/natgeo/",
    timestamp: new Date().toISOString(),
    username: "natgeo"
  },
  
  // Default fallback for any other account
  default: {
    caption: "This is a fallback post generated because Instagram data could not be retrieved. Instagram frequently updates their website to prevent automated access. For production use, consider using the official Instagram API.",
    imageUrl: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    postUrl: "https://www.instagram.com/",
    timestamp: new Date().toISOString(),
    username: "instagram_account"
  }
};

/**
 * Get a mock Instagram post for the specified username
 */
export function getMockInstagramPost(username: string): InstagramPost {
  const normalizedUsername = username.toLowerCase();
  // Return specific mock data if available, otherwise return default with correct username
  const post = MOCK_INSTAGRAM_POSTS[normalizedUsername] || {
    ...MOCK_INSTAGRAM_POSTS.default,
    username
  };
  
  // Always update timestamp to current time
  return {
    ...post,
    timestamp: new Date().toISOString()
  };
}
