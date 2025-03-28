import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ContentMetadata } from '../../../../../../core/models/content.models';


export type PromptType = 'metadata' | 'part' | 'section';

@Injectable({
  providedIn: 'root'
})
export class PromptService {
  private promptCache: Record<string, string> = {};

  constructor(private http: HttpClient) {}

  getSystemPrompt(type: PromptType = 'metadata'): Observable<string> {
    const cacheKey = `system_${type}`;
    if (this.promptCache[cacheKey]) {
      return from(Promise.resolve(this.promptCache[cacheKey]));
    }

    return this.http.get(`prompts/system_${type}.txt`, { responseType: 'text' })
      .pipe(
        map(content => {
          this.promptCache[cacheKey] = content;
          return content;
        }),
        catchError(error => {
          console.error(`Error loading system ${type} prompt:`, error);
          const defaultPrompt = `Default system prompt for ${type} generation...`;
          this.promptCache[cacheKey] = defaultPrompt;
          return from(Promise.resolve(defaultPrompt));
        })
      );
  }

  getUserPrompt(type: PromptType = 'metadata'): Observable<string> {
    const cacheKey = `user_${type}`;
    if (this.promptCache[cacheKey]) {
      return from(Promise.resolve(this.promptCache[cacheKey]));
    }

    return this.http.get(`prompts/user_${type}.txt`, { responseType: 'text' })
      .pipe(
        map(content => {
          this.promptCache[cacheKey] = content;
          return content;
        }),
        catchError(error => {
          console.error(`Error loading user ${type} prompt:`, error);
          const defaultPrompt = `Default user prompt for ${type} generation...`;
          this.promptCache[cacheKey] = defaultPrompt;
          return from(Promise.resolve(defaultPrompt));
        })
      );
  }

  generatePrompt(template: string, data: { 
    title: string; 
    description: string; 
    context?: string;
    language?: string;
    metadataContext?: string;
    partContext?: string;
  }): string {
    

    const result = template
      .replace(/\{\{title\}\}/g, data.title || '')
      .replace(/\{\{description\}\}/g, data.description || '')
      .replace(/\{\{context\}\}/g, data.context || '')
      .replace(/\{\{language\}\}/g, data.language || 'English')
      .replace(/\{\{metadataContext\}\}/g, data.metadataContext || '')
      .replace(/\{\{partContext\}\}/g, data.partContext || '');


    return result;
  }

   generateMetadata(data: {
    title: string;
    description: string;
    context?: string;
  }): ContentMetadata {
  
    return this.emptyContentMetadata();
  }

  emptyContentMetadata(): ContentMetadata {
    return {
      title: '',
      description: '',
      partsMetadata: [],
      id: '',
      status: 'draft',
      categoryKey: '',
      language: '',
      keywords: [],
      type: 'article',
      coverImage: '',
      zipUrl: '',
      authors: [],
      createdAt: '',
      updatedAt: '',
      version: '1',
      audios_path: ''
      
    };
  }

  
} 
