import { Injectable } from '@angular/core';
import { ContentService } from './content.service';

@Injectable({
  providedIn: 'root'
})
export class SectionViewService {
  private imageCache = new Map<string, string>();

  constructor(private contentService: ContentService) {}

  async getImageUrl(sectionId: string): Promise<string> {
    const imageKey = `${sectionId}/section${sectionId}.jpg`;
    
    if (this.imageCache.has(imageKey)) {
      const imageUrl = this.imageCache.get(imageKey);
      if (imageUrl) {
        return imageUrl;
      }
    }

    try {
      const imageUrl = await this.contentService.getImageUrl(imageKey);
      if (imageUrl) {
        this.imageCache.set(imageKey, imageUrl);
        return imageUrl;
      }
    } catch (error) {
      console.error('Error loading image:', error);
    }
    
    return '';
  }

  scrollToTop() {
    requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
} 