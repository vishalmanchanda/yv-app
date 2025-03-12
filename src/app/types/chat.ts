export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  summary?: string;
  explanation?: string;
  references?: Reference[];
  error?: boolean;
}

export interface Reference {
    verse?: string;
    text?: string;
    source?: string;
    link?: string;
} 

export interface ChatResponse {
    summary?: string;
    explanation?: string;
    references?: Reference[];
    error?: boolean;
}