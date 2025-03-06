import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';   


@Injectable({
  providedIn: 'root'
})
export class ContentConfigService {
  // Get base URL from environment or other configuration
  private baseContentUrl = environment.contentBaseUrl;

  getContentUrl(categoryKey: string, contentId: string): string {
    // You can implement different URL patterns based on your hosting strategy
    switch(environment.contentSource) {
      case 'googleStorage':
        return `${this.baseContentUrl}/${categoryKey}/${contentId}.zip`;
      case 'github':
        return `${this.baseContentUrl}/assets/content/${categoryKey}/${contentId}.zip`;
      default:
        return `/assets/content/${categoryKey}/${contentId}.zip`;
    }
  }
} 