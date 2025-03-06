import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsService } from '../../services/settings.service';
import { ShareService } from '../../services/share.service';
import { ScrollHideDirective } from '../../directives/scroll-hide.directive';

@Component({
  selector: 'cr-toolbar',
  standalone: true,
  imports: [CommonModule, ScrollHideDirective],
  template: `
    <div class="toolbar" [class.show]="isVisible" *ngIf="isVisible" crScrollHide>
      <div class="toolbar-content">
        <div class="toolbar-group">
          <button class="toolbar-btn p-3" (click)="adjustFontSize(-1)" title="Decrease font size">
            <i class="fas fa-font fa-sm"></i>
          </button>
          <button class="toolbar-btn p-3" (click)="adjustFontSize(1)" title="Increase font size">
            <i class="fas fa-font fs-5"></i>
          </button>
        </div>

        <div class="toolbar-group">
          <button class="toolbar-btn p-3" (click)="toggleImages()" [class.active]="showImages" title="Toggle images">
            <i class="fas fa-image fs-5"></i>
          </button>
          <button class="toolbar-btn p-3" (click)="toggleTheme()" title="Toggle theme">
            <i class="fas fa-sun fs-5" [class.fa-moon]="!isDarkTheme"></i>
          </button>
        </div>

        <div class="toolbar-group">
          <button class="toolbar-btn p-3" (click)="sharePDF()" title="Share">
            <i class="bi bi-share-fill text-success"></i>
          </button>
          <button class="toolbar-btn close-btn p-3 text-danger"  (click)="toggle()" title="Close toolbar">
            <i class="fas fa-close fs-5"></i>
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent {
  isVisible = false;
  showImages = true;
  isDarkTheme = false;
  @Output() advancedSettingsClicked = new EventEmitter<void>();
  @Output() shareClicked = new EventEmitter<void>();
  @Output() toggleImageShow = new EventEmitter<void>();


  constructor(
    private settingsService: SettingsService,
    private shareService: ShareService
  ) {
    this.settingsService.getPreferences().subscribe(prefs => {
      this.isDarkTheme = prefs.theme === 'dark';
  //    this.showImages = prefs.showImages;
    });
  }

  toggle() {
    this.isVisible = !this.isVisible;

  }

  adjustFontSize(delta: number) {
    this.settingsService.adjustFontSize(delta);
  }

  toggleImages() {
    this.showImages = !this.showImages;
    this.toggleImageShow.emit();
  
  }

  toggleTheme() {
    this.isDarkTheme = !this.isDarkTheme;
    this.settingsService.updatePreference('theme', this.isDarkTheme ? 'dark' : 'light');
  }

  sharePDF() {
    this.shareClicked.emit();

  }

  openAdvancedSettings() {
    this.advancedSettingsClicked.emit();
  }
} 