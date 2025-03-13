export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  summary?: string;
  details?: string;
  references?: Reference[];
  error?: boolean;
}

export interface Reference {
    verse?: string;
    text?: string;
    source?: string;
    chapter?: string;
    
} 

export interface ChatResponse {
    summary_answer?: string;
    detailed_answer?: string;
    references?: Reference[];
    error?: boolean;
}