import { Injectable } from '@angular/core';
import { BehaviorSubject, of, tap } from 'rxjs';
import { UserPreferences } from '../../../core/models/content.models'; 

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private readonly STORAGE_KEY = 'reader_preferences';
  private currentTheme: string | undefined;
  private preferences = new BehaviorSubject<UserPreferences>({
    theme: 'light',
    fontSize: 16,
    lineSpacing: 1.5,
    fontFamily: 'Arial'
  });

  constructor() {
    this.loadPreferences();
    const prefs = this.preferences.value;
    this.applyTheme(prefs.theme);
    this.currentTheme = prefs.theme;
  }

  private loadPreferences() {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      this.preferences.next(JSON.parse(stored));
    }
  }

  private applyTheme(theme: string) {
    document.documentElement.setAttribute('data-bs-theme', theme);
    
    // Force a repaint to ensure theme changes are applied
    document.body.style.display = 'none';
    // document.body.offsetHeight;
    document.body.style.display = '';
  }

  updatePreferences(prefs: Partial<UserPreferences>) {
    const current = this.preferences.value;
    const updated = { ...current, ...prefs };
    
    // Apply theme first if it's changing
    if (prefs.theme && prefs.theme !== current.theme) {
      this.applyTheme(prefs.theme);
    }
    
    // Update storage and notify subscribers
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    this.preferences.next(updated);
  }

  getPreferences() {
    return this.preferences.asObservable();
  }

  getThemePreferences() {
    return of({
      theme: this.currentTheme || 'light'
    }).pipe(
      tap(prefs => {
        // Only update theme if it's not already set
        if (!document.documentElement.dataset['theme']) {
          document.documentElement.dataset['theme'] = prefs.theme;
        }
      })
    );
  }

  getTheme() {
    return this.preferences.value.theme;
  }

  updatePreference(key: keyof UserPreferences, value: any) {
    this.updatePreferences({ [key]: value });
  }

  adjustFontSize(delta: number) {
    const current = this.preferences.value;
    const newSize = Math.max(10, current.fontSize + delta);
    this.updatePreference('fontSize', newSize);
  }

  shareCurrentSectionAsPDF() {
    console.log('shareCurrentSectionAsPDF');
  }
} 
