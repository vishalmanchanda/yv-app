import { Injectable } from '@angular/core';
import { SearchResult } from './search.service';
import { openDB, IDBPDatabase } from 'idb';

export interface SearchState {
  query: string;
  results: SearchResult[];
  currentPage: number;
  totalPages: number;
  paginatedResults: SearchResult[];
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SearchStateService {
  private db: IDBPDatabase | null = null;
  private readonly DB_NAME = 'readerDB';
  private readonly STORE_NAME = 'searchState';

  async initDB() {
    this.db = await openDB(this.DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('searchState')) {
          db.createObjectStore('searchState');
        }
      },
    });
  }

  async saveSearchState(state: SearchState) {
    if (!this.db) await this.initDB();
    await this.db?.put(this.STORE_NAME, state, 'currentSearch');
  }

  async getSearchState(): Promise<SearchState | null> {
    if (!this.db) await this.initDB();
    return this.db?.get(this.STORE_NAME, 'currentSearch') || null;
  }

  async clearSearchState() {
    if (!this.db) await this.initDB();
    await this.db?.delete(this.STORE_NAME, 'currentSearch');
  }

  async isSearchActive(): Promise<boolean> {
    const searchState = await this.getSearchState();
    return searchState?.isActive || false;
  }
} 
