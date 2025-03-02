import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserSettingsService } from '../../core/services/user-settings.service';
import { UserSettings } from '../../core/models/user-settings.model';
import { NotificationService } from '../../core/services/notification.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="row">
        <div class="col-md-3">
          <div class="list-group settings-nav">
            <a class="list-group-item list-group-item-action"
               [class.active]="activeSection === 'appearance'"
               (click)="setActiveSection('appearance')">
              <i class="bi bi-palette me-2"></i> Appearance
            </a>
            <a class="list-group-item list-group-item-action"
               [class.active]="activeSection === 'notifications'"
               (click)="setActiveSection('notifications')">
              <i class="bi bi-bell me-2"></i> Notifications
            </a>
            <a class="list-group-item list-group-item-action"
               [class.active]="activeSection === 'language'"
               (click)="setActiveSection('language')">
              <i class="bi bi-translate me-2"></i> Language
            </a>
            <a class="list-group-item list-group-item-action"
               [class.active]="activeSection === 'accessibility'"
               (click)="setActiveSection('accessibility')">
              <i class="bi bi-person-badge me-2"></i> Accessibility
            </a>
            <a class="list-group-item list-group-item-action"
               [class.active]="activeSection === 'advanced'"
               (click)="setActiveSection('advanced')">
              <i class="bi bi-gear me-2"></i> Advanced
            </a>
          </div>
          
          <div class="mt-4">
            <button class="btn btn-outline-danger w-100" (click)="resetSettings()">
              Reset to Defaults
            </button>
          </div>
        </div>
        
        <div class="col-md-9">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0">{{ getSectionTitle() }}</h5>
              <button class="btn btn-primary" (click)="saveSettings()" [disabled]="isSaving">
                <span *ngIf="isSaving" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Save Changes
              </button>
            </div>
            
            <div class="card-body">
              <!-- Appearance Settings -->
              <div *ngIf="activeSection === 'appearance'">
                <div class="mb-4">
                  <h6>Theme Mode</h6>
                  <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" id="darkModeToggle" 
                           [(ngModel)]="settings.darkMode" (change)="onDarkModeChange()">
                    <label class="form-check-label" for="darkModeToggle">
                      Dark Mode
                    </label>
                  </div>
                </div>
                
                <div class="mb-4">
                  <h6>Color Theme</h6>
                  <div class="d-flex flex-wrap gap-2">
                    <div *ngFor="let theme of colorThemes" 
                         class="color-theme-option" 
                         [class.active]="settings.colorTheme === theme.value"
                         [style.backgroundColor]="theme.color"
                         (click)="settings.colorTheme = theme.value">
                    </div>
                  </div>
                </div>
                
                <div class="mb-4">
                  <h6>Sidebar</h6>
                  <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" id="sidebarToggle" 
                           [(ngModel)]="settings.sidebarExpanded">
                    <label class="form-check-label" for="sidebarToggle">
                      Expanded by default
                    </label>
                  </div>
                </div>
              </div>
              
              <!-- Notifications Settings -->
              <div *ngIf="activeSection === 'notifications'">
                <div class="form-check form-switch mb-3">
                  <input class="form-check-input" type="checkbox" id="enableNotifications" 
                         [(ngModel)]="settings.notifications">
                  <label class="form-check-label" for="enableNotifications">
                    Enable Notifications
                  </label>
                </div>
                
                <div class="mb-3" *ngIf="settings.notifications">
                  <h6>Notification Types</h6>
                  <div class="form-check mb-2">
                    <input class="form-check-input" type="checkbox" id="notifyUpdates" checked>
                    <label class="form-check-label" for="notifyUpdates">
                      System Updates
                    </label>
                  </div>
                  <div class="form-check mb-2">
                    <input class="form-check-input" type="checkbox" id="notifyMessages" checked>
                    <label class="form-check-label" for="notifyMessages">
                      New Messages
                    </label>
                  </div>
                  <div class="form-check mb-2">
                    <input class="form-check-input" type="checkbox" id="notifyAlerts" checked>
                    <label class="form-check-label" for="notifyAlerts">
                      System Alerts
                    </label>
                  </div>
                </div>
              </div>
              
              <!-- Language Settings -->
              <div *ngIf="activeSection === 'language'">
                <div class="mb-3">
                  <label for="languageSelect" class="form-label">Display Language</label>
                  <select class="form-select" id="languageSelect" [(ngModel)]="settings.language">
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                    <option value="ja">日本語</option>
                  </select>
                </div>
                
                <div class="mb-3">
                  <label for="dateFormatSelect" class="form-label">Date Format</label>
                  <select class="form-select" id="dateFormatSelect">
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
                
                <div class="mb-3">
                  <label for="timeFormatSelect" class="form-label">Time Format</label>
                  <select class="form-select" id="timeFormatSelect">
                    <option value="12">12-hour (AM/PM)</option>
                    <option value="24">24-hour</option>
                  </select>
                </div>
              </div>
              
              <!-- Accessibility Settings -->
              <div *ngIf="activeSection === 'accessibility'">
                <div class="mb-3">
                  <label for="fontSizeSelect" class="form-label">Font Size</label>
                  <select class="form-select" id="fontSizeSelect" [(ngModel)]="settings.fontSize">
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>
                
                <div class="mb-3">
                  <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" id="highContrastToggle">
                    <label class="form-check-label" for="highContrastToggle">
                      High Contrast Mode
                    </label>
                  </div>
                </div>
                
                <div class="mb-3">
                  <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" id="reduceMotionToggle">
                    <label class="form-check-label" for="reduceMotionToggle">
                      Reduce Motion
                    </label>
                  </div>
                </div>
              </div>
              
              <!-- Advanced Settings -->
              <div *ngIf="activeSection === 'advanced'">
                <div class="mb-3">
                  <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" id="enableAnalyticsToggle">
                    <label class="form-check-label" for="enableAnalyticsToggle">
                      Enable Analytics
                    </label>
                  </div>
                  <small class="text-muted">
                    Allow us to collect anonymous usage data to improve the application.
                  </small>
                </div>
                
                <div class="mb-3">
                  <button class="btn btn-outline-secondary" (click)="clearCache()">
                    Clear Application Cache
                  </button>
                </div>
                
                <div class="mb-3">
                  <button class="btn btn-outline-danger" (click)="exportData()">
                    Export My Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings-nav {
      position: sticky;
      top: 1rem;
    }
    
    .color-theme-option {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      cursor: pointer;
      transition: all 0.2s;
      border: 2px solid transparent;
    }
    
    .color-theme-option.active {
      border-color: var(--bs-primary);
      transform: scale(1.1);
    }
    
    .list-group-item {
      cursor: pointer;
    }
  `]
})
export class SettingsComponent implements OnInit {
  settings: UserSettings = {
    darkMode: false,
    language: 'en',
    notifications: true,
    sidebarExpanded: true,
    fontSize: 'medium',
    colorTheme: 'default'
  };
  
  originalSettings: UserSettings = { ...this.settings };
  activeSection = 'appearance';
  isSaving = false;
  
  colorThemes = [
    { name: 'Default', value: 'default', color: '#0d6efd' },
    { name: 'Green', value: 'green', color: '#198754' },
    { name: 'Purple', value: 'purple', color: '#6f42c1' },
    { name: 'Orange', value: 'orange', color: '#fd7e14' },
    { name: 'Teal', value: 'teal', color: '#20c997' }
  ];
  
  constructor(
    private userSettingsService: UserSettingsService,
    private notificationService: NotificationService,
    private themeService: ThemeService
  ) {}
  
  ngOnInit(): void {
    this.userSettingsService.settings$.subscribe(settings => {
      this.settings = { ...settings };
      this.originalSettings = { ...settings };
    });
  }
  
  setActiveSection(section: string): void {
    this.activeSection = section;
  }
  
  getSectionTitle(): string {
    switch (this.activeSection) {
      case 'appearance': return 'Appearance Settings';
      case 'notifications': return 'Notification Preferences';
      case 'language': return 'Language & Localization';
      case 'accessibility': return 'Accessibility Options';
      case 'advanced': return 'Advanced Settings';
      default: return 'Settings';
    }
  }
  
  onDarkModeChange(): void {
    this.themeService.setTheme(this.settings.darkMode ? 'dark' : 'light');
  }
  
  saveSettings(): void {
    this.isSaving = true;
    
    this.userSettingsService.updateSettings(this.settings).subscribe({
      next: () => {
        this.isSaving = false;
        this.originalSettings = { ...this.settings };
        this.notificationService.success('Settings saved successfully');
      },
      error: (error) => {
        this.isSaving = false;
        this.notificationService.error('Failed to save settings');
        console.error('Settings save error:', error);
      }
    });
  }
  
  resetSettings(): void {
    if (confirm('Are you sure you want to reset all settings to default values?')) {
      this.userSettingsService.resetToDefaults();
      this.notificationService.success('Settings reset to defaults');
    }
  }
  
  clearCache(): void {
    // Implement cache clearing logic
    setTimeout(() => {
      this.notificationService.success('Application cache cleared');
    }, 1000);
  }
  
  exportData(): void {
    // Implement data export logic
    setTimeout(() => {
      const dummyData = {
        user: {
          name: 'John Doe',
          email: 'john@example.com'
        },
        settings: this.settings,
        // Add more user data here
      };
      
      const dataStr = JSON.stringify(dummyData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = 'user-data.json';
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      this.notificationService.success('Data exported successfully');
    }, 1000);
  }
} 