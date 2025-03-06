import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { StorageService } from './storage.service';
import { UserProgress, Bookmark } from '../../../core/models/content.models';

@Injectable({
  providedIn: 'root'
})
export class ProgressService {
  private currentProgress = new BehaviorSubject<UserProgress>({
    currentPart: 1,
    lastPosition: 0,
    bookmarks: [],
    lastRead: new Date()
  });

  constructor(private storageService: StorageService) {
    this.loadProgress();
  }

  private async loadProgress() {
    const stored = await this.storageService.getProgress();
    if (stored) {
      this.currentProgress.next(stored);
    }
  }

  async updateProgress(partId: number, position: number) {
    const progress = this.currentProgress.value;
    progress.currentPart = partId;
    progress.lastPosition = position;
    progress.lastRead = new Date();
    
    await this.storageService.updateProgress(progress);
    this.currentProgress.next(progress);
  }

  async addBookmark(bookmark: Bookmark) {
    const progress = this.currentProgress.value;
    progress.bookmarks.push(bookmark);
    
    await this.storageService.updateProgress(progress);
    this.currentProgress.next(progress);
  }

  async removeBookmark(bookmarkId: string) {
    const progress = this.currentProgress.value;
    progress.bookmarks = progress.bookmarks.filter(b => 
      b.partId + '-' + b.subsectionId !== bookmarkId
    );
    
    await this.storageService.updateProgress(progress);
    this.currentProgress.next(progress);
  }

  getProgress() {
    return this.currentProgress.asObservable();
  }
} 