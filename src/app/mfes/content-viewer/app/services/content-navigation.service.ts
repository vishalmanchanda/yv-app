import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ContentNavigationService {
  constructor(private router: Router) {}

  navigateToCategory(key: string): void {
    this.router.navigate(['/content-viewer/category', key]);
  }

  navigateToReader(params: any): void {
    this.router.navigate(['/content-viewer/reader'], { queryParams: params });
  }

  navigateToContent(locale: string, category: string, contentId: string): void {
    this.router.navigate(['/content-viewer/content', locale, category, contentId]);
  }

  // Add other navigation methods as needed
} 