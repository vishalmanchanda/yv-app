import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { StorageService } from './storage.service';
import { Author } from '../../../core/models/content.models';
@Injectable({
  providedIn: 'root'
})
export class AuthorStateService {
  private authorSelections = new Map<string, Author>();
  private selectedAuthorSubject = new BehaviorSubject<Author | null>(null);

  constructor(private storageService: StorageService) {}

  async setSelectedAuthor(author: Author, contentId: string) {
    this.authorSelections.set(contentId, author);
    this.selectedAuthorSubject.next(author);
    // Persist to IndexedDB
    await this.storageService.storeAuthorSelection(contentId, author);
  }

  async getSelectedAuthor(contentId: string): Promise<Author | null> {
    // First check in-memory cache
    let author = this.authorSelections.get(contentId);
    
    if (!author) {
      // If not in memory, try to load from IndexedDB
      author = await this.storageService.getAuthorSelection(contentId) as Author | undefined;
      if (author) {
        // Update in-memory cache
        this.authorSelections.set(contentId, author);
      }
    }
    
    return author || null;
  }

  getSelectedAuthorObservable(): Observable<Author | null> {
    return this.selectedAuthorSubject.asObservable();
  }
}