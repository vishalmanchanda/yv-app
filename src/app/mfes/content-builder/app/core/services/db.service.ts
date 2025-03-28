import { Injectable } from '@angular/core';
import { ContentMetadata } from '../../../../../core/models/content.models';


@Injectable({
  providedIn: 'root'
})
export class DbService {
  private readonly DB_NAME = 'content-builder-db';
  private readonly DB_VERSION = 1;
  private db: IDBDatabase | null = null;

  async initDb(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create stores
        if (!db.objectStoreNames.contains('content')) {
          db.createObjectStore('content', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('drafts')) {
          db.createObjectStore('drafts', { keyPath: 'id' });
        }
      };
    });
  }

  async saveContent(content: ContentMetadata): Promise<void> {
    if (!this.db) await this.initDb();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['content'], 'readwrite');
      const store = transaction.objectStore('content');
      
      const request = store.put(content);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getContent(id: string): Promise<ContentMetadata | null> {
    if (!this.db) await this.initDb();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['content'], 'readonly');
      const store = transaction.objectStore('content');
      
      const request = store.get(id);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }
} 