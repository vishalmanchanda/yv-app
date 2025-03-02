import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private isEnabled = false;

  constructor(
    private router: Router,
    private configService: ConfigService
  ) {
    this.isEnabled = this.configService.isFeatureEnabled('analytics');
    
    if (this.isEnabled) {
      this.initRouteTracking();
    }
  }

  private initRouteTracking() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.trackPageView(event.urlAfterRedirects);
    });
  }

  trackPageView(url: string) {
    if (!this.isEnabled) return;
    
    // Implement your analytics tracking here
    console.log('Page view:', url);
    
    // Example with Google Analytics
    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('config', 'YOUR-GA-ID', {
        page_path: url
      });
    }
  }

  trackEvent(category: string, action: string, label?: string, value?: number) {
    if (!this.isEnabled) return;
    
    console.log('Event:', { category, action, label, value });
    
    // Example with Google Analytics
    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value
      });
    }
  }

  setUser(userId: string) {
    if (!this.isEnabled) return;
    
    // Set user ID for analytics
    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('set', { user_id: userId });
    }
  }
} 