import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themeSubject = new BehaviorSubject<Theme>(this.getInitialTheme());
  theme$ = this.themeSubject.asObservable();

  constructor() {
    // Apply theme on service initialization
    this.applyTheme(this.themeSubject.value);
  }

  private getInitialTheme(): Theme {
    // Check localStorage or system preference
    const stored = localStorage.getItem('theme') as Theme;
    if (stored) {
      return stored;
    }
    
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'light';
  }

  private applyTheme(theme: Theme) {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }

  setTheme(theme: Theme) {
    this.applyTheme(theme);
    this.themeSubject.next(theme);
  }

  toggleTheme() {
    const newTheme = this.themeSubject.value === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  isDarkTheme(): boolean {
    return this.themeSubject.value === 'dark';
  }
} 