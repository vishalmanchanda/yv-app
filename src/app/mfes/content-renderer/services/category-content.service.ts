import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Bookmark, ContentItem } from '../../../core/models/content.models';

import { ContentService } from './content.service';
import { StorageService } from './storage.service';


@Injectable({
  providedIn: 'root'
})
export class CategoryContentService {
  constructor(private http: HttpClient, private contentService: ContentService, 
    private storageService: StorageService) {}

  async getCategoryContent(categoryKey: string, locale = 'en'): Promise<ContentItem[] | undefined> {  
    return await this.http.get<ContentItem[]>(`assets/content/domains/${categoryKey}_${locale}.json`).toPromise();
  }

  async getContentItem(categoryKey: string, locale = 'en', contentId: string): Promise<ContentItem | null> {
    const content = await this.getCategoryContent(categoryKey, locale);
    return content?.find(item => item.id === contentId) || null;
  }

  async loadContentItem(categoryKey: string, locale = 'en', contentId: string) {
    console.log('loadContentItem', categoryKey, locale, contentId);
    const contentItem = await this.getContentItem(categoryKey, locale, contentId);
    console.log('contentItem', contentItem);
    if (contentItem) {
      const isLoaded = await this.contentService.isContentItemLoaded(contentItem);
      if (!isLoaded) {
        await this.loadContent(contentItem);
      }
    }else{      

      this.loadContentZipWithNamingConvention(categoryKey, locale, contentId);
      
      // this.loadContentZipFromGithub(categoryKey, locale, contentId);
      throw new Error('Content item not found');
    }
  }

  async loadContent(contentItem: ContentItem) {
    try{
      await this.contentService.loadContentPackage(contentItem.zipUrl);
    }catch(error){
      console.error('Error loading content', error);
      // try to load the content using conventional url
      this.loadContentZipWithNamingConvention(contentItem.categoryKey, contentItem.language, contentItem.id);
      
    }
  }

  async loadContentZipWithNamingConvention(categoryKey: string, locale: string, contentId: string) {
    const url = `assets/content/domains/${categoryKey}_${contentId}_${locale}.json`;
    console.log('loading content from url', url);
    try{
    await this.contentService.loadContentPackage(url);
    }catch(error){
      console.log('Not available in the content list'+error+' - Lets try to load from repository');
      await this.loadContentZipFromGithub(categoryKey,locale,contentId)
      
    }
    
  }

  async loadContentZipFromGithub(categoryKey: string, locale: string, contentId: string) {
    const fileName = categoryKey+"_"+contentId+"_"+locale+".zip";
    await this.contentService.loadContentPackage("https://vishalmanchanda.github.io/assets/"+fileName);
  }

  async loadBookmarks(count = 4) {
    const bookmarks = await this.storageService.getRecentResumeBookMarks(count);
    return bookmarks;
  }

  async updateBookmark(bookmark: Bookmark) {
    await this.storageService.updateResumeBookMark(bookmark);
  }
}
