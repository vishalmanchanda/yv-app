import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserPreferences, UserPreferencesService } from '../../../core/services/user-preferences.service';

@Component({
  selector: 'app-preferences-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="preferences-panel">
      <h3>User Preferences</h3>
      
      <div class="preference-section">
        <h4>Appearance</h4>
        <div class="form-group">
          <label>Theme</label>
          <select 
            class="form-select" 
            [ngModel]="(preferences$ | async)?.theme"
            (ngModelChange)="updateTheme($event)">
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>

        <div class="form-group">
          <label>Font Size</label>
          <select 
            class="form-select"
            [ngModel]="(preferences$ | async)?.fontSize"
            (ngModelChange)="updateFontSize($event)">
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>
      </div>

      <div class="preference-section">
        <h4>Notifications</h4>
        <div class="form-check">
          <input 
            type="checkbox" 
            class="form-check-input" 
            id="emailNotif"
            [checked]="(preferences$ | async)?.notifications?.email"
            (change)="toggleNotification('email')">
          <label class="form-check-label" for="emailNotif">Email Notifications</label>
        </div>
        <div class="form-check">
          <input 
            type="checkbox" 
            class="form-check-input" 
            id="pushNotif"
            [checked]="(preferences$ | async)?.notifications?.push"
            (change)="toggleNotification('push')">
          <label class="form-check-label" for="pushNotif">Push Notifications</label>
        </div>
        <div class="form-check">
          <input 
            type="checkbox" 
            class="form-check-input" 
            id="desktopNotif"
            [checked]="(preferences$ | async)?.notifications?.desktop"
            (change)="toggleNotification('desktop')">
          <label class="form-check-label" for="desktopNotif">Desktop Notifications</label>
        </div>
      </div>

      <div class="preference-section">
        <h4>Dashboard</h4>
        <div class="form-check">
          <input 
            type="checkbox" 
            class="form-check-input" 
            id="welcomeSection"
            [checked]="(preferences$ | async)?.dashboardLayout?.showWelcome"
            (change)="toggleDashboardOption('showWelcome')">
          <label class="form-check-label" for="welcomeSection">Show Welcome Section</label>
        </div>
        <div class="form-check">
          <input 
            type="checkbox" 
            class="form-check-input" 
            id="compactView"
            [checked]="(preferences$ | async)?.dashboardLayout?.compactView"
            (change)="toggleDashboardOption('compactView')">
          <label class="form-check-label" for="compactView">Compact View</label>
        </div>
      </div>

      <div class="mt-3">
        <button class="btn btn-secondary" (click)="resetPreferences()">
          Reset to Defaults
        </button>
      </div>
    </div>
  `,
  styles: [`
    .preferences-panel {
      background: var(--card-bg);
      padding: 1.5rem;
      border-radius: 8px;
      color: var(--text-primary);
    }

    .preference-section {
      margin-bottom: 1.5rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid var(--border-color);
    }

    h3 {
      margin-bottom: 1.5rem;
      color: var(--text-primary);
    }

    h4 {
      color: var(--text-secondary);
      margin-bottom: 1rem;
      font-size: 1.1rem;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-check {
      margin-bottom: 0.5rem;
    }

    .form-select {
      background-color: var(--bg-primary);
      color: var(--text-primary);
      border-color: var(--border-color);
    }

    .form-check-input {
      background-color: var(--bg-primary);
      border-color: var(--border-color);
    }

    .form-check-input:checked {
      background-color: var(--bs-primary);
      border-color: var(--bs-primary);
    }
  `]
})
export class PreferencesPanelComponent {
  readonly preferences$;

  constructor(private preferencesService: UserPreferencesService) {
    this.preferences$ = this.preferencesService.preferences$;
  }

  updateTheme(theme: 'light' | 'dark') {
    this.preferencesService.setTheme(theme);
  }

  updateFontSize(fontSize: 'small' | 'medium' | 'large') {
    this.preferencesService.setFontSize(fontSize);
  }

  toggleNotification(type: keyof UserPreferences['notifications']) {
    this.preferencesService.toggleNotification(type);
  }

  toggleDashboardOption(option: 'showWelcome' | 'compactView') {
    const current = this.preferencesService.getPreference('dashboardLayout');
    this.preferencesService.updatePreferences({
      dashboardLayout: {
        ...current,
        [option]: !current[option]
      }
    });
  }

  resetPreferences() {
    this.preferencesService.resetPreferences();
  }
} 