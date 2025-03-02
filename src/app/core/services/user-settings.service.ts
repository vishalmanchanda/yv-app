import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserSettings, defaultUserSettings } from '../models/user-settings.model';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from './config.service';
import { AuthService } from '../auth/auth.service';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserSettingsService {
  private settingsSubject = new BehaviorSubject<UserSettings>(defaultUserSettings);
  public settings$ = this.settingsSubject.asObservable();
  
  constructor(
    private http: HttpClient,
    private configService: ConfigService,
    private authService: AuthService
  ) {
    this.loadSettings();
    
    // Reload settings when user changes
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.loadSettings();
      } else {
        this.resetToDefaults();
      }
    });
  }
  
  private loadSettings(): void {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      this.loadFromLocalStorage();
      return;
    }
    
    const apiUrl = this.configService.getConfig().apiUrl;
    this.http.get<UserSettings>(`${apiUrl}/users/${userId}/settings`)
      .pipe(
        tap({
          error: () => this.loadFromLocalStorage()
        })
      )
      .subscribe(settings => {
        this.settingsSubject.next(settings);
        localStorage.setItem('userSettings', JSON.stringify(settings));
      });
  }
  
  private loadFromLocalStorage(): void {
    const storedSettings = localStorage.getItem('userSettings');
    if (storedSettings) {
      try {
        const settings = JSON.parse(storedSettings);
        this.settingsSubject.next({...defaultUserSettings, ...settings});
      } catch (e) {
        this.settingsSubject.next(defaultUserSettings);
      }
    } else {
      this.settingsSubject.next(defaultUserSettings);
    }
  }
  
  updateSettings(settings: Partial<UserSettings>): Observable<UserSettings> {
    const currentSettings = this.settingsSubject.value;
    const updatedSettings = {...currentSettings, ...settings};
    
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      this.settingsSubject.next(updatedSettings);
      localStorage.setItem('userSettings', JSON.stringify(updatedSettings));
      return new Observable(observer => {
        observer.next(updatedSettings);
        observer.complete();
      });
    }
    
    const apiUrl = this.configService.getConfig().apiUrl;
    return this.http.patch<UserSettings>(`${apiUrl}/users/${userId}/settings`, settings)
      .pipe(
        tap(response => {
          this.settingsSubject.next(response);
          localStorage.setItem('userSettings', JSON.stringify(response));
        })
      );
  }
  
  resetToDefaults(): void {
    this.settingsSubject.next(defaultUserSettings);
    localStorage.removeItem('userSettings');
    
    const userId = this.authService.getCurrentUserId();
    if (userId) {
      const apiUrl = this.configService.getConfig().apiUrl;
      this.http.delete(`${apiUrl}/users/${userId}/settings/reset`).subscribe();
    }
  }
} 