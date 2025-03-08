import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkTheme = new BehaviorSubject<boolean>(this.initializeTheme());
  isDarkTheme$ = this.darkTheme.asObservable();

  private initializeTheme(): boolean {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  constructor() {
    // Apply theme immediately on service initialization
    this.applyTheme(this.darkTheme.value);
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', e => {
        if (!localStorage.getItem('theme')) {
          this.setTheme(e.matches);
        }
      });
  }

  private applyTheme(isDark: boolean) {
    document.documentElement.setAttribute('data-bs-theme', isDark ? 'dark' : 'light');
    // Add a transition class to the body for smooth theme changes
    document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    
    // Add specific theme class
    document.body.classList.remove(isDark ? 'light-theme' : 'dark-theme');
    document.body.classList.add(isDark ? 'dark-theme' : 'light-theme');
  }

  setTheme(isDark: boolean) {
    this.darkTheme.next(isDark);
    this.applyTheme(isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }

  toggleTheme() {
    this.setTheme(!this.darkTheme.value);
  }

  getCurrentTheme(): boolean {
    return this.darkTheme.value;
  }
} 