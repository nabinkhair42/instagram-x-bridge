export interface SummarizationRequest {
  text: string;
  maxLength?: number;
}

export interface SummarizationResponse {
  originalText: string;
  summary: string;
  characterCount: number;
}

export interface LLMOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface LLMResponse {
  success: boolean;
  content?: string;
  error?: string;
}
