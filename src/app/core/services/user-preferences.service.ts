import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface UserPreferences {
  theme: 'light' | 'dark';
  sidebarExpanded: boolean;
  fontSize: 'small' | 'medium' | 'large';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    desktop: boolean;
  };
  dashboardLayout: {
    showWelcome: boolean;
    compactView: boolean;
    favorites: string[];
  };
}

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'light',
  sidebarExpanded: true,
  fontSize: 'medium',
  language: 'en',
  notifications: {
    email: true,
    push: true,
    desktop: true
  },
  dashboardLayout: {
    showWelcome: true,
    compactView: false,
    favorites: []
  }
};

@Injectable({
  providedIn: 'root'
})
export class UserPreferencesService {
  private readonly STORAGE_KEY = 'user_preferences';
  private preferencesSubject = new BehaviorSubject<UserPreferences>(this.loadPreferences());
  preferences$ = this.preferencesSubject.asObservable();

  constructor() {
    // Initialize preferences
    this.loadPreferences();
  }

  private loadPreferences(): UserPreferences {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
    return DEFAULT_PREFERENCES;
  }

  private savePreferences(preferences: UserPreferences) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(preferences));
      this.preferencesSubject.next(preferences);
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  }

  updatePreferences(updates: Partial<UserPreferences>) {
    const current = this.preferencesSubject.value;
    const updated = { ...current, ...updates };
    this.savePreferences(updated);
  }

  resetPreferences() {
    this.savePreferences(DEFAULT_PREFERENCES);
  }

  getPreference<K extends keyof UserPreferences>(key: K): UserPreferences[K] {
    return this.preferencesSubject.value[key];
  }

  toggleSidebar() {
    const current = this.preferencesSubject.value;
    this.updatePreferences({
      sidebarExpanded: !current.sidebarExpanded
    });
  }

  setTheme(theme: 'light' | 'dark') {
    this.updatePreferences({ theme });
  }

  setFontSize(fontSize: 'small' | 'medium' | 'large') {
    this.updatePreferences({ fontSize });
  }

  toggleNotification(type: keyof UserPreferences['notifications']) {
    const current = this.preferencesSubject.value;
    this.updatePreferences({
      notifications: {
        ...current.notifications,
        [type]: !current.notifications[type]
      }
    });
  }

  addFavorite(itemId: string) {
    const current = this.preferencesSubject.value;
    if (!current.dashboardLayout.favorites.includes(itemId)) {
      this.updatePreferences({
        dashboardLayout: {
          ...current.dashboardLayout,
          favorites: [...current.dashboardLayout.favorites, itemId]
        }
      });
    }
  }

  removeFavorite(itemId: string) {
    const current = this.preferencesSubject.value;
    this.updatePreferences({
      dashboardLayout: {
        ...current.dashboardLayout,
        favorites: current.dashboardLayout.favorites.filter(id => id !== itemId)
      }
    });
  }
} 