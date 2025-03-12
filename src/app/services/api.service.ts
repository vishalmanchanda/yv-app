import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ChatMessage } from '../types/chat';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private http: HttpClient) {}

  /**
   * Gets a response from the chat API
   */
  async getChatResponse(message: string): Promise<ChatMessage> {
    try {
      const response = await firstValueFrom(
        this.http.post<ChatMessage>('/api/chat', { message })
      );
      return response;
    } catch (error) {
      console.error('Error getting chat response:', error);
      // Return a fallback error message
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again later.',
        timestamp: new Date()
      };
    }
  }

  /**
   * Gets autocomplete suggestions based on input
   */
  async getSuggestions(input: string): Promise<string[]> {
    try {
      return await firstValueFrom(
        this.http.get<string[]>(`/api/suggestions?query=${encodeURIComponent(input)}`)
      );
    } catch (error) {
      console.error('Error getting suggestions:', error);
      return [];
    }
  }

  /**
   * Gets a predicted query based on input
   */
  async getPredictedQuery(input: string): Promise<string | null> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ prediction: string }>(`/api/predict?query=${encodeURIComponent(input)}`)
      );
      return response.prediction;
    } catch (error) {
      console.error('Error getting predicted query:', error);
      return null;
    }
  }
} 