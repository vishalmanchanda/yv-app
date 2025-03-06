import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ToastService } from '../../../../content-renderer/core/services/toast.service';

import { SettingsService } from '../../../../content-renderer/services/settings.service';
import { UserPreferences } from '../../../../../core/models/content.models';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
  ],

  template: `
    <!-- Off-canvas Menu -->
  <div class="offcanvas-menu" [class.show]="showOffcanvas">
    <div class="offcanvas-header">
      <div class="brand">
        <img src="assets/images/jyotir.jpg" alt="Jyotir-Gamay" class="logo-img">
        <div class="brand-text">
          <h5>Yoga Vivek</h5>
          <small>Let the real be experienced</small>
        </div>
      </div>
      <button class="close-btn" (click)="closeCanvas()">
        <i class="fas fa-times"></i>
      </button>
    </div>

    <div class="offcanvas-body">
      <div class="menu-section opacity-75">
        <h6 class="menu-title">MAIN MENU</h6>
        <div class="list-group">
          
          <!-- Add more menu items here -->
          <a class="list-group-item" (click)="openBookmarks()">
            <i class="fas fa-bookmark"></i>
            <span>Bookmarks</span>
          </a>
          <a class="list-group-item" (click)="openReadingHistory()">
            <i class="fas fa-history"></i>
            <span>Reading History</span>
          </a>
          <label class="list-group-item cursor-pointer">
                <i class="fa-solid fa-file-import"></i>
                Import Content
                <input type="file" class="d-none" (change)="onFileSelected($event)">
              </label>
              <!-- <input type="text" class="form-control" placeholder="Enter URL" id="urlInput">
              <button class="btn btn-primary" (click)="onURLSelected($event)">Import</button> -->
        </div>
      </div>

      <div class="menu-section opacity-75">
        <h6 class="menu-title">PREFERENCES</h6>
        <div class="list-group">
          <a class="list-group-item" (click)="openAdvancedSettings()">
            <i class="fas fa-cog"></i>
            <span>Settings</span>
          </a>
          <a class="list-group-item" (click)="toggleTheme()">
            <i class="fas" [class.fa-moon]="theme === 'light'" [class.fa-sun]="theme === 'dark'"></i>
            <span *ngIf="theme === 'light'">Dark Mode</span>
            <span *ngIf="theme === 'dark'">Light Mode</span>
          </a>
        </div>
      </div>
    </div>

    <div class="offcanvas-footer">
      <div class="app-version">Version 1.0.0</div>
    </div>
  </div>
  <div class="offcanvas-backdrop" [class.show]="showOffcanvas" (click)="toggleOffcanvas()"></div>  
  `,
  styleUrls: ['./sidebar.component.scss']
  
})
export class SidebarComponent implements OnInit {
  constructor(
    private toastr: ToastService,  
    private router: Router,
    private settingsService: SettingsService
  ) {}

  @Input() showOffcanvas = true;
  @Input() categoryKey = '';
  @Input() sidebarRequired = false;
  theme = 'light';
  @Output() closeSidebar = new EventEmitter<void>();
  @Output() openSettings = new EventEmitter<void>();
  @Output() contentLoaded = new EventEmitter<File>();
  @Output() contentURLSelected = new EventEmitter<string>();
  

  ngOnInit(): void {
    this.settingsService.getPreferences().subscribe((prefs: UserPreferences) => {
      this.theme = prefs.theme;
    });
  }

  toggleOffcanvas() {
    this.showOffcanvas = !this.showOffcanvas;
  }
  goToCategory() {
    if (this.categoryKey) {
      this.router.navigate(['/category', this.categoryKey]);
    }else{
      this.router.navigate(['/home']);
    }
  }
  closeCanvas() {
    this.closeSidebar.emit();
  }
  openAdvancedSettings() {
    this.closeCanvas();
    this.openSettings.emit();
  }
  toggleTheme() {
    this.closeCanvas();
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    this.settingsService.updatePreferences({theme: this.theme as 'light' | 'dark'});
  }

  onFileSelected(event: any) {
    this.closeCanvas();
    const file = event.target.files[0];
    if (file && file.type === 'application/zip') {
      this.contentLoaded.emit(file);
    } else {
      alert('Please select a valid ZIP file');
    }
  }

  async onURLSelected(event: any) {
    this.closeCanvas();
    const url = (document.getElementById('urlInput') as HTMLInputElement).value;
    console.log('URL selected: ' + url);
    if (url) {
      this.contentURLSelected.emit(url);
    }
  }

  openBookmarks() {
    this.closeCanvas();
    
  }

  openReadingHistory() {
    this.closeCanvas();
    
  }
} 
