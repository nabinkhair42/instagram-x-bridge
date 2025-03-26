import OpenAI from 'openai';
import { LLM_PROMPTS, MAX_TWEET_LENGTH } from '../../config/llm-prompts';
import { env } from '../../config/env';
import logger from '../../utils/logger';
import { LLMOptions, LLMResponse, SummarizationRequest, SummarizationResponse } from '../../types/llm';

/**
 * LLM Service responsible for text summarization
 */
export class LLMService {
  private openai: OpenAI | null = null;
  
  constructor() {
    // Only initialize OpenAI if API key is available
    if (env.LLM_API_KEY) {
      this.openai = new OpenAI({
        apiKey: env.LLM_API_KEY,
      });
    } else {
      logger.warn('OpenAI API key not provided, using fallback summarization');
    }
  }
  
  /**
   * Summarize text using LLM
   */
  async summarizeText(request: SummarizationRequest): Promise<SummarizationResponse> {
    const { text, maxLength = MAX_TWEET_LENGTH } = request;
    
    try {
      // Check if OpenAI client is available
      if (!this.openai || !env.LLM_API_KEY) {
        logger.warn('No LLM API key provided, using basic summarization');
        return this.basicSummarize(text, maxLength);
      }
      
      logger.info(`Summarizing text of length ${text.length} with LLM`);
      
      const llmResponse = await this.callLLM(
        LLM_PROMPTS.SUMMARIZE_INSTAGRAM(text, maxLength),
        { maxTokens: maxLength }
      );
      
      if (!llmResponse.success || !llmResponse.content) {
        logger.warn(`LLM summarization failed: ${llmResponse.error}, using basic summarization`);
        return this.basicSummarize(text, maxLength);
      }
      
      const summary = llmResponse.content.trim();
      
      if (summary.length > maxLength) {
        logger.warn(`Summary exceeds max length (${summary.length} > ${maxLength}), truncating`);
        return {
          originalText: text,
          summary: summary.substring(0, maxLength - 3) + '...',
          characterCount: maxLength
        };
      }
      
      return {
        originalText: text,
        summary,
        characterCount: summary.length
      };
    } catch (error) {
      logger.error('Error summarizing text with LLM, using basic summarization', error);
      return this.basicSummarize(text, maxLength);
    }
  }
  
  /**
   * Basic fallback summarization when LLM is unavailable
   */
  private basicSummarize(text: string, maxLength: number): SummarizationResponse {
    // Simple truncation with basic rules
    let summary = text;
    
    // If text is too long, truncate
    if (summary.length > maxLength) {
      // Find a good sentence or period to break at
      const lastPeriodPosition = summary.substring(0, maxLength - 3).lastIndexOf('.');
      
      if (lastPeriodPosition > maxLength / 2) {
        // Break at last complete sentence
        summary = summary.substring(0, lastPeriodPosition + 1);
      } else {
        // Simple truncation with ellipsis
        summary = summary.substring(0, maxLength - 3) + '...';
      }
    }
    
    return {
      originalText: text,
      summary: summary,
      characterCount: summary.length
    };
  }
  
  /**
   * Call the LLM API with a prompt
   */
  private async callLLM(prompt: string, options: LLMOptions = {}): Promise<LLMResponse> {
    try {
      if (!this.openai) {
        return {
          success: false,
          error: 'OpenAI client not initialized'
        };
      }
      
      const { model = env.LLM_MODEL, temperature = env.LLM_TEMPERATURE, maxTokens } = options;
      
      const response = await this.openai.chat.completions.create({
        model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature,
        max_tokens: maxTokens,
      });
      
      const content = response.choices[0]?.message?.content;
      
      if (!content) {
        return {
          success: false,
          error: 'No content returned from LLM'
        };
      }
      
      return {
        success: true,
        content
      };
    } catch (error) {
      logger.error('Error calling LLM API', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error calling LLM'
      };
    }
  }
}

export default new LLMService();
