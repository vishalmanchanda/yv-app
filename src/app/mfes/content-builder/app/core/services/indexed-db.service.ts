import { Injectable } from '@angular/core';
import { StorageService } from '../../../../content-renderer/services/storage.service';
import { ContentMetadata, Part } from '../../../../../core/models/content.models';

@Injectable({
  providedIn: 'root'
})
export class IndexedDbService {
  private readonly DB_NAME = 'content-builder-db';
  private readonly DB_VERSION = 1;
  private db: IDBDatabase | null = null;

  async initDatabase(): Promise<void> {
    console.log('IndexedDbService: Initializing database...');
    
    // Check if IndexedDB is supported
    if (!window.indexedDB) {
      const error = 'Your browser doesn\'t support IndexedDB. Content Builder features will not work.';
      console.error(error);
      throw new Error(error);
    }
    
    return new Promise((resolve, reject) => {
      try {
        const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

        request.onerror = (event) => {
          const error = `IndexedDB error: ${(event.target as IDBRequest).error?.message || 'Unknown error'}`;
          console.error(error, event);
          reject(new Error(error));
        };
        
        request.onsuccess = () => {
          this.db = request.result;
          console.log('IndexedDbService: Database opened successfully');
          resolve();
        };

        request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
          console.log('IndexedDbService: Database upgrade needed, creating stores...');
          const db = (event.target as IDBOpenDBRequest).result;

          // Create parts store with contentId index and composite key
          if (!db.objectStoreNames.contains('parts')) {
            const partsStore = db.createObjectStore('parts', { 
              keyPath: ['contentId', 'id'] 
            });
            partsStore.createIndex('contentId', 'contentId', { unique: false });
            console.log('IndexedDbService: Created parts store');
          }

          // Create contents store
          if (!db.objectStoreNames.contains('contents')) {
            db.createObjectStore('contents', { keyPath: 'id' });
            console.log('IndexedDbService: Created contents store');
          }
          
          // Create images store
          if (!db.objectStoreNames.contains('images')) {
            db.createObjectStore('images', { keyPath: 'key' });
            console.log('IndexedDbService: Created images store');
          }
        };
      } catch (error) {
        console.error('IndexedDbService: Critical error during database initialization', error);
        reject(error);
      }
    });
  }

  async getParts(contentId: string): Promise<Part[] | null> {
    console.log(`IndexedDbService: Getting parts for content ID: ${contentId}`);
    await this.ensureDbConnection();
    try {
      const parts = await this.performTransaction('parts', 'readonly', store => 
        store.index('contentId').getAll(contentId)
      );
      console.log(`IndexedDbService: Found ${parts?.length || 0} parts for content ID: ${contentId}`);
      return parts;
    } catch (error) {
      console.error(`IndexedDbService: Error getting parts for content ID: ${contentId}`, error);
      throw error;
    }
  }

  private async ensureDbConnection(): Promise<void> {
    if (!this.db) {
      console.log('IndexedDbService: Database not initialized, initializing now...');
      await this.initDatabase();
    }
  }

  private async performTransaction<T>(
    storeName: string, 
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore) => IDBRequest<T>
  ): Promise<T | null> {
    return new Promise((resolve, reject) => {
      try {
        if (!this.db) {
          const error = 'Database not initialized';
          console.error(`IndexedDbService: ${error}`);
          reject(new Error(error));
          return;
        }

        const transaction = this.db.transaction(storeName, mode);
        const store = transaction.objectStore(storeName);
        const request = operation(store);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => {
          const error = `Transaction error: ${request.error?.message || 'Unknown error'}`;
          console.error(`IndexedDbService: ${error}`, request.error);
          reject(new Error(error));
        };
      } catch (error) {
        console.error(`IndexedDbService: Error during transaction on store ${storeName}`, error);
        reject(error);
      }
    });
  }

  clearDB(): void {
    console.log('IndexedDbService: Clearing database...');
    if (this.db) {
      try {
        // This actually doesn't work during an active connection
        // We should close the connection and delete the database instead
        const dbName = this.db.name;
        this.db.close();
        this.db = null;
        indexedDB.deleteDatabase(dbName);
        console.log('IndexedDbService: Database cleared');
      } catch (error) {
        console.error('IndexedDbService: Error clearing database', error);
      }
    }
  }

  async getContent(contentId: string): Promise<ContentMetadata | null> {
    console.log(`IndexedDbService: Getting content with ID: ${contentId}`);
    await this.ensureDbConnection();
    try {
      const content = await this.performTransaction('contents', 'readonly', store => 
        store.get(contentId)
      );
      console.log(`IndexedDbService: ${content ? 'Found' : 'Did not find'} content with ID: ${contentId}`);
      return content;
    } catch (error) {
      console.error(`IndexedDbService: Error getting content with ID: ${contentId}`, error);
      throw error;
    }
  }

  async saveContent(content: ContentMetadata): Promise<IDBValidKey | null> {
    try {
      console.log('IndexedDbService: Saving content:', content);
      await this.ensureDbConnection();
      
      // Ensure content has an ID
      if (!content.id) {
        content.id = this.generateId();
        console.log(`IndexedDbService: Generated new ID for content: ${content.id}`);
      }

      // Ensure required fields are present
      const contentToSave: ContentMetadata = {
        ...content,
        createdAt: content.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: content.status || 'draft',
        version: content.version || '1.0.0'
      };

      const result = await this.performTransaction('contents', 'readwrite', store => 
        store.put(contentToSave)
      );
      console.log(`IndexedDbService: Content saved successfully with ID: ${content.id}`);
      return result;
    } catch (error) {
      console.error('IndexedDbService: Error in saveContent:', error);
      throw error;
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  async savePart(contentId: string, part: Part): Promise<IDBValidKey | null> {
    console.log(`IndexedDbService: Saving part ${part.id} for content ID: ${contentId}`);
    await this.ensureDbConnection();
    try {
      const result = await this.performTransaction('parts', 'readwrite', store => 
        store.put({ ...part, contentId })
      );
      console.log(`IndexedDbService: Part ${part.id} saved successfully for content ID: ${contentId}`);
      return result;
    } catch (error) {
      console.error(`IndexedDbService: Error saving part ${part.id} for content ID: ${contentId}`, error);
      throw error;
    }
  }

  async getPart(contentId: string, partId: number): Promise<Part | null> {
    console.log(`IndexedDbService: Getting part ${partId} for content ID: ${contentId}`);
    await this.ensureDbConnection();
    try {
      const part = await this.performTransaction('parts', 'readonly', store => 
        store.get([contentId, partId])
      );
      console.log(`IndexedDbService: ${part ? 'Found' : 'Did not find'} part ${partId} for content ID: ${contentId}`);
      return part;
    } catch (error) {
      console.error(`IndexedDbService: Error getting part ${partId} for content ID: ${contentId}`, error);
      throw error;
    }
  }

  async getAllContents(): Promise<ContentMetadata[]> {
    console.log('IndexedDbService: Getting all contents');
    await this.ensureDbConnection();
    try {
      const contents = await this.performTransaction('contents', 'readonly', store => 
        store.getAll()
      );
      console.log(`IndexedDbService: Found ${contents?.length || 0} contents`);
      return contents ?? [];
    } catch (error) {
      console.error('IndexedDbService: Error getting all contents', error);
      throw error;
    }
  }

  async deleteContent(contentId: string): Promise<void> {
    await this.ensureDbConnection();
    // Delete content metadata
    await this.performTransaction('contents', 'readwrite', store => 
      store.delete(contentId)
    );    
    // Delete all associated parts using the contentId index
    if(this.db){
    const transaction = this.db.transaction('parts', 'readwrite');
    const store = transaction.objectStore('parts');
    const index = store.index('contentId');
    const request = index.openKeyCursor(IDBKeyRange.only(contentId));
    
    return new Promise((resolve, reject) => {
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          store.delete(cursor.primaryKey);
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
      });
    }
  } 

  async copyContentToViewer(contentId: string): Promise<boolean> {
    // Implement copying logic here
    console.log('copying content to viewer', contentId);
    const storageService = new StorageService();
    await storageService.clearDatabase();

    const content = await this.getContent(contentId);
    if(content){
      const parts = await this.getParts(contentId);
      if(parts){       
        storageService.storeMetadata(content);
        parts.forEach(part => {
          storageService.storePart(part);
        });
        return true;
      }
    }
    return false;
  }

  async saveImage(key: string, imageBlob: Blob): Promise<void> {
    try {
      await this.ensureDbConnection();
      await this.performTransaction('images', 'readwrite', store => 
        store.put({ key, blob: imageBlob })
      );
    } catch (error) {
      console.error('Error saving image:', error);
      throw error;
    }
  }

  async getImage(key: string): Promise<Blob | null> {
    await this.ensureDbConnection();
    const result = await this.performTransaction('images', 'readonly', store => 
      store.get(key)
    );
    return result?.blob || null;
  }

  async deleteImage(key: string): Promise<void> {
    await this.ensureDbConnection();
    await this.performTransaction('images', 'readwrite', store => 
      store.delete(key)
    );
  }

  async getAllImages(contentId: string): Promise<{ [key: string]: Blob }> {
    await this.ensureDbConnection();
    const result: { [key: string]: Blob } = {};
    let allKeys: IDBValidKey[] = [];
   
    await this.performTransaction('images', 'readonly', store => {  
      const request = store.getAllKeys();
      request.onsuccess = () => {
        allKeys = request.result;
      };
      return request;
    });
        
    for (const key of allKeys) {
      if (typeof key === 'string' && key.startsWith(`${contentId}_`)) {
        const blob = await this.getImage(key);
        if (blob) {
            result[key] = blob;
          }
        }
      }
    return result;
  }


  // async getAllImages(bookId: string): Promise<{ [key: string]: Blob }> {
    
  //   const allKeys = await store.getAllKeys();
  //   const result: { [key: string]: Blob } = {};

  //   for (const key of allKeys) {
  //     if (typeof key === 'string' && key.startsWith(`${bookId}_`)) {
  //       const blob = await store.get(key);
  //       if (blob) {
  //         result[key] = blob;
  //       }
  //     }
  //   }

  //   return result;
  // }

  
} 
