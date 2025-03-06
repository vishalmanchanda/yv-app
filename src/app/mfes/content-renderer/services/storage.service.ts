import { Injectable } from '@angular/core';
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { ContentMetadata, Part, UserProgress, UserPreferences, Bookmark } from '../../../core/models/content.models';  
import { Commentary } from '../models/reader.interface';
import { Author } from '../../../core/models/content.models';

interface ReaderDB extends DBSchema {
  metadata: {
    key: string;
    value: ContentMetadata & { id?: string };
  };
  parts: {
    key: number | string;
    value: Part;
  };
  progress: {
    key: string;
    value: UserProgress & { id?: string };
  };
  preferences: {
    key: string;
    value: UserPreferences & { id?: string };
  };
  images: {
    key: string;
    value: Blob;
  };
  commentary: {
    key: string;
    value: Commentary[] & { id?: string };
  };
  authorSelections: {
    key: string;
    value: {
      contentId: string;
      author: Author;
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private db: IDBPDatabase<ReaderDB> | null = null;
  private DB_NAME = 'content-viewer-db';
  private DB_VERSION = 1;

  async initDatabase() {
    if (!this.db) {
      this.db = await openDB<ReaderDB>(this.DB_NAME, this.DB_VERSION, {
        upgrade(db) {
          // Delete existing stores if they exist
          if (db.objectStoreNames.contains('metadata')) {
            db.deleteObjectStore('metadata');
          }
          if (db.objectStoreNames.contains('parts')) {
            db.deleteObjectStore('parts');
          }
          if (db.objectStoreNames.contains('images')) {
            db.deleteObjectStore('images');
          }
          if (db.objectStoreNames.contains('progress')) {
            db.deleteObjectStore('progress');
          }
          if (db.objectStoreNames.contains('preferences')) {
            db.deleteObjectStore('preferences');
          }
          if (db.objectStoreNames.contains('commentary')) {
            db.deleteObjectStore('commentary');
          }

          // Create new stores
          db.createObjectStore('metadata');
          db.createObjectStore('parts', { keyPath: 'id' });
          db.createObjectStore('images');
          db.createObjectStore('progress');
          db.createObjectStore('preferences');
          db.createObjectStore('commentary');

          // Add authorSelections store if it doesn't exist
          if (!db.objectStoreNames.contains('authorSelections')) {
            db.createObjectStore('authorSelections');
          }
        },
      });
    }
    return this.db;
  }

  async clearDatabase(): Promise<void> {
    const db = await this.initDatabase();
    await db.clear('metadata');
    await db.clear('parts');
    await db.clear('images');
    await db.clear('commentary');
    // await db.clear('progress');
    // await db.clear('preferences');
  }

  async hasImage(imageKey: string): Promise<boolean> {
    const db = await this.initDatabase();
    const result = await db.getKey('images', imageKey);
    return result !== undefined;
  }

  async storeMetadata(metadata: ContentMetadata): Promise<void> {
    const db = await this.initDatabase();
    await db.put('metadata', { ...metadata }, 'current');
  }

  async getMetadata(): Promise<ContentMetadata | undefined> {
    const db = await this.initDatabase();
    const result = await db.get('metadata', 'current');
    return result;
  }

  async storePart(part: Part): Promise<void> {
    const db = await this.initDatabase();
    await db.put('parts', part);
  }

  async getPart(id: number | string): Promise<Part | undefined> {
    try {
      const db = await this.initDatabase();
      console.log('getPart', id);

      let result = await db.get('parts', id);

      if (result === undefined){
        result = await db.get('parts', id.toString());
      }

      console.log('getPart result', result);
      
      return result;
    } catch (error) {
      console.error('Error getting part:', error);
      throw error;
    }
  }

  async storeImage(key: string, imageBlob: Blob): Promise<void> {
    const db = await this.initDatabase();
    await db.put('images', imageBlob, key);
  }

  async getImage(key: string): Promise<Blob | undefined> {
    const db = await this.initDatabase();
    return await db.get('images', key);
  }

  async getImageUrl(key: string): Promise<string | undefined> {
    try {
      const imageBlob = await this.getImage(key);
      return imageBlob ? URL.createObjectURL(imageBlob) : undefined;
    } catch (error) {
      console.error('Error getting image URL:', error);
      return undefined;
    }
  }

  async updateProgress(progress: UserProgress): Promise<void> {
    const db = await this.initDatabase();
    await db.put('progress', { ...progress }, 'current');
  }

  async getProgress(): Promise<UserProgress | undefined> {
    const db = await this.initDatabase();
    return await db.get('progress', 'current');
  }

  async updatePreferences(preferences: UserPreferences): Promise<void> {
    const db = await this.initDatabase();
    await db.put('preferences', { ...preferences }, 'current');
  }

  async getPreferences(): Promise<UserPreferences | undefined> {
    const db = await this.initDatabase();
    return await db.get('preferences', 'current');
  }

 

  async isContentItemLoaded(contentItemId: string): Promise<boolean> {
    const db = await this.initDatabase();
    const result = await db.get('metadata', contentItemId);
    return result !== undefined;
  }

  async updateResumeBookMark(bookmark: Bookmark): Promise<void> {
    if(bookmark.categoryKey && bookmark.contentId){
      const bookmarkWithTimestamp = {
        ...bookmark,
        timestamp: new Date()
      };
      localStorage.setItem(
        bookmark.categoryKey+"-"+bookmark.contentId+"-resume", 
        JSON.stringify(bookmarkWithTimestamp)
      );
    } else {
      console.error('Invalid bookmark', bookmark);
    }
  }
  
  async getResumeBookMark(categoryKey: string, contentId: string): Promise<Bookmark | undefined> {
    const resume = localStorage.getItem(categoryKey+"-"+contentId+"-resume");
    return resume ? JSON.parse(resume) : undefined;
  }

  async getRecentResumeBookMarks(maxCount:number): Promise<Bookmark[]> {
    const bookmarks = [];  
    const resumeBookmarks = Object.keys(localStorage).filter(key => key.endsWith('-resume'));
    console.log('resumeBookmarks', resumeBookmarks);
    for (const resumeBookmark of resumeBookmarks) {        
      const bookmark = localStorage.getItem(resumeBookmark);
      if (bookmark) {
        bookmarks.push(JSON.parse(bookmark));
      }
    }
    const sortedBookmarks = bookmarks.sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      return dateB.getTime() - dateA.getTime();
    });
    
    if (sortedBookmarks.length > maxCount){
      return sortedBookmarks.slice(0, maxCount);  
    }
    return sortedBookmarks;
  }

  async storeCommentary(authorKey: string, commentary: Commentary[]): Promise<void> {
    try{
      const db = await this.initDatabase();
      await db.put('commentary', commentary, authorKey);
    }catch(error){
      console.error('Error storing commentary', error);
    }
  }

  async getCommentary(authorKey: string, contentId: string, partDotSection: string): Promise<Commentary | undefined> {
    let foundCommentary: Commentary | undefined = undefined;
    const db = await this.initDatabase();
    const result = await db.get('commentary', authorKey);

    
    if (result && result.length > 0){
      result.forEach(commentary => {

        if (commentary.verseNum === partDotSection){
          foundCommentary = commentary;
        }
      });

       return foundCommentary;
    }
    return foundCommentary;
  }

  async storeAuthorSelection(contentId: string, author: Author): Promise<void> {
    const db = await this.initDatabase();
    await db.put('authorSelections', { contentId, author }, contentId);
  }

  async getAuthorSelection(contentId: string): Promise<Author | undefined> {
    const db = await this.initDatabase();
    const result = await db.get('authorSelections', contentId);
    return result?.author;
  }

   
  
} 