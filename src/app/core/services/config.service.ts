import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom } from 'rxjs';

export interface AppConfig {
  apiUrl: string;
  features: {
    darkMode: boolean;
    notifications: boolean;
    analytics: boolean;
  };
  mfeUrls: {
    [key: string]: string;
  };
  theme: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    danger: string;
  };
}

const DEFAULT_CONFIG: AppConfig = {
  apiUrl: 'http://localhost:3000',
  features: {
    darkMode: true,
    notifications: true,
    analytics: false
  },
  mfeUrls: {
    mfe1: 'http://localhost:4201',
    mfe2: 'http://localhost:4202'
  },
  theme: {
    primary: '#0d6efd',
    secondary: '#6c757d',
    success: '#198754',
    warning: '#ffc107',
    danger: '#dc3545'
  }
};

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private configSubject = new BehaviorSubject<AppConfig>(DEFAULT_CONFIG);
  config$ = this.configSubject.asObservable();

  constructor(private http: HttpClient) {}

  async loadConfig(): Promise<void> {
    try {
      const env = this.getEnvironment();
      const config = await firstValueFrom(
        this.http.get<AppConfig>(`/assets/config/config.${env}.json`)
      );
      this.configSubject.next({ ...DEFAULT_CONFIG, ...config });
    } catch (error) {
      console.warn('Failed to load config, using defaults:', error);
    }
  }

  getConfig(): AppConfig {
    return this.configSubject.value;
  }

  isFeatureEnabled(feature: keyof AppConfig['features']): boolean {
    return this.configSubject.value.features[feature];
  }

  getMfeUrl(mfeName: string): string {
    return this.configSubject.value.mfeUrls[mfeName] || '';
  }

  private getEnvironment(): string {
    // You can expand this logic based on your needs
    if (window.location.hostname === 'localhost') {
      return 'dev';
    }
    return 'prod';
  }
} 