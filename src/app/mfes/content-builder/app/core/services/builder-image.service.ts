import { Injectable } from '@angular/core';
import { IndexedDbService } from './indexed-db.service';
import JSZip from 'jszip';

@Injectable({
  providedIn: 'root'
})
export class BuilderImageService {
  constructor(private indexedDbService: IndexedDbService) {}

  private getImageKey(contentId: string, imagePath: string): string {
    const contentIdCamelCase = contentId.replace(/[^a-zA-Z0-9]/g, '');
    // Remove 'images/' prefix if it exists
    const cleanImagePath = imagePath.startsWith('images/') ? imagePath.slice(7) : imagePath;
    return `${contentIdCamelCase}_${cleanImagePath.replace(/\//g, '_')}`;
  }

  async storeImages(zip: JSZip, contentId: string): Promise<void> {
    const imageFiles = Object.keys(zip.files).filter(name => name.startsWith('images/') && name.endsWith('.jpg'));
    
    for (const imagePath of imageFiles) {
      const imageFile = zip.file(imagePath);
      if (imageFile) {
        const imageBlob = await imageFile.async('blob');
        const key = this.getImageKey(contentId, imagePath);
        await this.indexedDbService.saveImage(key, imageBlob);  
      }
    }
  }

  async getImageUrl(contentId: string, imagePath: string): Promise<string> {
    const key = this.getImageKey(contentId, imagePath);
    console.log(`Fetching image: ${key}`);
    const imageBlob = await this.indexedDbService.getImage(key);
    if (imageBlob) {
      console.log(`Image found: ${key}`);
      return URL.createObjectURL(imageBlob);
    } else {
      console.log(`Image not found: ${key}`);
      return this.getFallbackImageUrl(imagePath);
    }
  }

  getFallbackImageUrl(sectionType?: string): string {
    let randomNumber = Math.floor(Math.random() * 10);
    let url = "https://vishalmanchanda.github.io/assets/cp/default-"+randomNumber+".jpg";
    if (sectionType && sectionType == 'intro') {
      randomNumber = Math.floor(Math.random() * 6);
      url = "https://vishalmanchanda.github.io/assets/cp/intro-"+randomNumber+".jpg";
    }
    console.log('Fallback image url: '+url);
    return url;
  }

  async uploadImage(contentId: string, imagePath: string, imageBlob: Blob): Promise<void> {
    const key = this.getImageKey(contentId, imagePath);
    await this.indexedDbService.saveImage(key, imageBlob);
    console.log(`Image uploaded: ${key}`);
  }

  async getContentCoverImageUrl(contentId: string): Promise<string> {
    return this.getImageUrl(contentId, 'bookCover.jpg');
  }

  async getPartImageUrl(contentId: string, partNumber: number): Promise<string> {
    return this.getImageUrl(contentId, `${partNumber}.jpg`);
  }

  async getSectionImageUrl(contentId: string, partNumber: number, sectionNumber: number): Promise<string> {
    return this.getImageUrl(contentId, `${partNumber}/section${sectionNumber}.jpg`);
  }

    async getAllImages(contentId: string): Promise<{ [key: string]: Blob }> {
    return this.indexedDbService.getAllImages(contentId);
  }

  async removeImage(contentId: string, imagePath: string): Promise<void> {
    const key = this.getImageKey(contentId, imagePath);
    try {
      await this.indexedDbService.deleteImage(key);
      console.log(`Image removed from IndexedDB: ${key}`);
    } catch (error) {
      console.error(`Error removing image from IndexedDB: ${key}`, error);
      throw error;
    }
  }
}
