import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import JSZip from 'jszip';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { Bookmark, ContentItem, ContentMetadata, Part } from '../../../core/models/content.models';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class ContentService {
  private contentMetadata = new BehaviorSubject<ContentMetadata | null>(null);
  private contentItemsSubject = new BehaviorSubject<ContentItem[] | null>(null);
  private currentPart = new BehaviorSubject<Part | null>(null);
  private currentPartId = 1;
  category = '';
  contentItems: ContentItem[] | null = null;

  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) {
    // Initialize by loading metadata
    this.loadInitialMetadata();
  }

  private async loadInitialMetadata() {
    const metadata = await this.storageService.getMetadata();
    if (metadata) {
      this.contentMetadata.next(metadata);
    }
  }

  async loadPart(partId: number): Promise<void> {
    try {
      const part = await this.storageService.getPart(partId);
      if (part) {
        this.currentPartId = partId;
        this.currentPart.next(part);
      }
    } catch (error) {
      console.error('Error loading part:', error);
      throw error;
    }
  }

  async buildImageKey(partId: string, sectionId: string): Promise<string | null> {
    let imageKey = null;
    let hasImage = false;
    if (partId && sectionId) {
      imageKey = partId + '/section'+sectionId + '.jpg';
      hasImage = await this.hasImage(imageKey);
      if (hasImage) {
        return imageKey;
      }
    } else if (partId) {
      imageKey = partId + '.jpg';
      hasImage = await this.hasImage(imageKey);
      if (hasImage) {
        return imageKey;
      }
    } else{
      imageKey = 'bookCover.jpg';
      hasImage = await this.hasImage(imageKey);
      if (hasImage) {
        return imageKey;
      } 
    }
    return imageKey;
  }

  getMetadata(): Observable<ContentMetadata | null> {
    return this.contentMetadata.asObservable();
  }

  getCurrentPart(): Observable<Part | null> {
    return this.currentPart.asObservable();
  }

  async loadPreviousPart(): Promise<void> {
    if (this.currentPartId > 1) {
      await this.loadPart(this.currentPartId - 1);
    }
  }

  async loadNextPart(): Promise<void> {
    const metadata = this.contentMetadata.value;
    if (metadata && this.currentPartId < metadata.partsMetadata.length) {
      await this.loadPart(this.currentPartId + 1);
    }
  }

  hasPreviousPart(): boolean {
    return this.currentPartId > 1;
  }

  hasNextPart(): boolean {
    const metadata = this.contentMetadata.value;
    return metadata ? this.currentPartId < metadata.partsMetadata.length : false;
  }

  async loadContentPackage(url: string): Promise<void> {
    try {
      console.log('Loading content package from', url);
      const response = await this.http.get(url, { responseType: 'arraybuffer' }).toPromise();
      if (!response) throw new Error('No response from server');

      const zip = new JSZip();
      const content = await zip.loadAsync(response);
          
      // Load metadata
     await this.loadContent(content);
      console.log('Content stored');
    } catch (error) {
      console.error('Error loading content package:', error);
      throw error;
    }
  }

  async loadContent(content: JSZip): Promise<void> {
    try { 
      const metaFile = await content.file('meta.json')?.async('text');
      console.log('Loading metadata file '+metaFile);
      if (!metaFile) throw new Error('No metadata file found');
      console.log('Metadata file found');

      const metadata: ContentMetadata = JSON.parse(metaFile);

      this.contentMetadata.next(metadata);
      console.log('Metadata loaded '+ metadata.title);
      
      // Initialize IndexedDB storage
      await this.storeContent(content, metadata);
      localStorage.setItem('lastLoadedContentItemId', metadata.id);
    } catch (error) {
      console.error('Error loading content:', error);
      throw error;
    }
  }

  async hasImage(imageKey: string): Promise<boolean> {
    return this.storageService.hasImage(imageKey);
  }

  async getImageUrl(imageKey: string): Promise<string> {
    console.log('Getting image url for '+imageKey);
    if (imageKey === '' || imageKey === null){
      imageKey = 'bookCover.jpg';
    }
    try {
      const db = await this.storageService.initDatabase();
      const imageStore = db.transaction('images', 'readonly').objectStore('images');
      
      // Try to get the requested image
      let image = await imageStore.get(imageKey);
      if (image) {
        console.log(`Image found: ${imageKey}`);
        return URL.createObjectURL(image);
      }else{
        console.warn(`Image not found: ${imageKey}`);
        if (this.contentMetadata.value && this.contentMetadata.value.coverImage) {
          return this.contentMetadata.value.coverImage;
        }
      }
      
      
      // Try to get the part cover image
      const partId = imageKey.split('/')[0];
      if (partId) {
        const partCoverKey = `${partId}.jpg`;
        image = await imageStore.get(partCoverKey);
        if (image) {
          console.log(`Using part cover image: ${partCoverKey}`);
          return URL.createObjectURL(image);
        }
      }
      
      // Try to get the book cover image
      image = await imageStore.get('bookCover.jpg');
      if (image) {
        console.log('Using book cover image');
        return URL.createObjectURL(image);
      }
      

      return this.getFallbackImageUrl();
      
    } catch (error) {
      console.error('Error retrieving image:', error);
      return this.getCoverImageUrl();
    }
  }

  private async storeContent(zip: JSZip, metadata: ContentMetadata): Promise<void> {
    // Clear existing data first
    await this.storageService.clearDatabase();
    
    // Store metadata
    await this.storageService.storeMetadata(metadata);

    // Store parts
    for (const partMeta of metadata.partsMetadata) {
      const partFileName =  partMeta.id + '.json';
      console.log('Part file name:', partFileName);
      const partFile = await zip.file(partFileName)?.async('text');
      if (partFile) {
        console.log('Part file found '+partFileName);
        const partData: Part = JSON.parse(partFile);
        await this.storageService.storePart(partData);
      }
    }

    // Store images
    const imageFiles = zip.folder('images');
    if (imageFiles) {

      for (const [path, file] of Object.entries(imageFiles.files)) {
        if (!file.dir) {
          const imageBlob = await file.async('blob');
          const imagePath = path.replace('images/', '');
          await this.storageService.storeImage(imagePath, imageBlob);
        }
      }
    }
    console.log('Images stored');
  }

  getCoverImageUrl(): string {
    const metadata = this.contentMetadata.value;
    return metadata?.coverImage || this.getFallbackImageUrl();
  }

  getFallbackImageUrl(sectionType?: string): string {
    // random number between 1 and 11 including 1 and 11 but not 0
    let randomNumber = Math.floor(Math.random() * 11) + 1;
    let url = "https://vishalmanchanda.github.io/assets/cp/default-"+randomNumber+".jpg";
    // Intro image
    if (sectionType && sectionType == 'intro') {
      randomNumber = Math.floor(Math.random() * 6) + 1;
      url = "https://vishalmanchanda.github.io/assets/cp/intro-"+randomNumber+".jpg";
    }
    console.log('Fallback image url: '+url);
    return url;
  }

  getPart(partId: number): Promise<Part | undefined> {
    return this.storageService.getPart(partId);
  }

  clearDatabase(): Promise<void> {
    return this.storageService.clearDatabase();
  }
  

  async loadLastLoadedContentItem(): Promise<void> {
    if (this.contentItems && this.contentItems.length > 0) {
      const lastLoadedContentItemId = localStorage.getItem('lastLoadedContentItemId');
      if (lastLoadedContentItemId) {
        await this.loadContentPackage(this.contentItems[this.contentItems.findIndex(item => item.id === lastLoadedContentItemId)].zipUrl);
      }
    }
  }

  async isContentItemLoaded(contentItem: ContentItem): Promise<boolean>   {
      const metadata = await firstValueFrom(this.getMetadata());
      if (metadata) {
        return (metadata.id === contentItem.id && 
          metadata.language === contentItem.language &&
          metadata.categoryKey === contentItem.categoryKey);
      }
      return false;
  }

  async loadContentItemById(contentItemId: string): Promise<void> {
    if (this.contentItems && this.contentItems.length > 0) {
      await this.loadContentPackage(this.contentItems[this.contentItems.findIndex(item => item.id === contentItemId)].zipUrl);
    }else{
      throw new Error('No content items loaded');
    }
  }

  async getCurrentMetadata(): Promise<ContentMetadata | undefined> {
    return await this.storageService.getMetadata();
  }

  async getPopularKeywords(): Promise<string[]> {
    const metadata = await this.getCurrentMetadata();
    if (metadata) {
      return metadata.keywords || [];
    }
    return [];
  }

  async updateResumeBookMark(bookmark: Bookmark){
    await this.storageService.updateResumeBookMark(bookmark);
  }

  async getResumeBookMark(categoryKey: string, contentId: string): Promise<Bookmark | undefined> {
    return await this.storageService.getResumeBookMark(categoryKey, contentId);
  }
} 