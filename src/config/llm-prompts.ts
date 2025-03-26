export const LLM_PROMPTS = {
  /**
   * Prompt for summarizing Instagram captions into tweets
   */
  SUMMARIZE_INSTAGRAM: (caption: string, maxLength: number = 280) => `
    Summarize the following Instagram caption into a tweet of maximum ${maxLength} characters.
    Preserve the key information and tone. Do not use hashtags unless they're crucial to the message.
    
    INSTAGRAM CAPTION:
    ${caption}
    
    TWEET SUMMARY:
  `,

  /**
   * Prompt for extracting key information from Instagram captions
   */
  EXTRACT_KEY_INFO: (caption: string) => `
    Extract the most important information from this Instagram caption:
    
    ${caption}
    
    Return only the essential facts and details that would be most newsworthy or relevant to readers.
  `,
};

export const MAX_TWEET_LENGTH = 280;
