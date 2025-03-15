import { Component, EventEmitter, Input, Output, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { ChatbotService } from '../../mfes/chatbot/chatbot.service';
import { SettingsService } from '../../mfes/content-renderer/services/settings.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { UserMenuComponent } from '../user-menu/user-menu.component';
import { UserPreferencesService } from '../../core/services/user-preferences.service';

@Component({
  selector: 'app-modern-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, UserMenuComponent],
  template: `
    <nav class="navbar navbar-expand-lg fixed-top shadow-sm" [class.navbar-light]="!isDarkTheme" [class.navbar-dark]="isDarkTheme" [class.bg-dark]="isDarkTheme" [class.bg-light]="!isDarkTheme">
      <div class="container-fluid px-2">
        <!-- Mobile View Layout -->
        <div class="d-flex d-lg-none align-items-center justify-content-between w-100">
          <!-- Left Actions with Logo -->
          <div class="d-flex align-items-center gap-1">
            <button class="btn btn-link nav-link p-1" type="button" (click)="toggleSidebar.emit()">
              <i class="bi bi-list fs-4"></i>
            </button>
            <a class="navbar-brand d-flex align-items-center p-0" routerLink="/">
              <span>{{ brandName }}</span>
            </a>
          </div>

          <!-- Right Actions -->
          <div class="d-flex align-items-center gap-1">
            <button class="btn btn-link nav-link p-1" (click)="toggleTheme()">
              <i class="bi" [class.bi-sun]="isDarkTheme" [class.bi-moon]="!isDarkTheme"></i>
            </button>

            <!-- Sidebar Toggle Button -->
            <button class="btn btn-link nav-link p-1 d-none d-md-block d-lg-none" (click)="toggleSidebarVisibility()">
              <i class="bi" [class.bi-layout-sidebar]="!showSidebar" [class.bi-layout-sidebar-inset]="showSidebar"></i>
            </button>

            <!-- Mobile Menu Toggle -->
            <div class="dropdown">
              <button class="btn btn-link nav-link p-1" 
                      type="button" 
                      (click)="toggleMobileMenu()"
                      #mobileMenuTrigger>
                <i class="bi bi-three-dots-vertical"></i>
              </button>
              <!-- Mobile Menu Dropdown -->
              <div class="dropdown-menu dropdown-menu-end mobile-menu" 
                   [class.show]="isMobileMenuOpen">
                
                <div class="mobile-menu-items">
                  <a *ngFor="let link of navLinks" 
                     class="dropdown-item d-flex align-items-center"
                     [routerLink]="link.route"
                     routerLinkActive="active"
                     [routerLinkActiveOptions]="{exact: link.exact}"
                     (click)="onMobileMenuItemClick()">
                    <i [class]="link.icon + ' me-2'"></i>
                    <span>{{ link.label }}</span>
                  </a>
                </div>
                <div class="dropdown-divider"></div>
                <!-- Additional Actions -->
                <a class="dropdown-item d-flex align-items-center" (click)="toggleSidebarVisibility()">
                  <i class="bi" [class.bi-layout-sidebar]="!showSidebar" [class.bi-layout-sidebar-inset]="showSidebar"></i>
                  <span>{{ showSidebar ? 'Hide Sidebar' : 'Show Sidebar' }}</span>
                </a>
              </div>
            </div>

            <!-- User Menu (Mobile) -->
            <app-user-menu [user]="user" class="mobile-user-menu"></app-user-menu>
          </div>
        </div>

        <!-- Desktop View Layout -->
        <div class="d-none d-lg-flex align-items-center justify-content-between w-100">
          <!-- Left section with brand and navigation -->
          <div class="d-flex align-items-center">
            <a class="navbar-brand d-flex align-items-center" routerLink="/">
              <span>{{ brandName }}</span>
            </a>
          </div>

          <!-- Right section with actions -->
          <div class="d-flex align-items-center gap-2">
            <ul class="navbar-nav ms-4">
              <li class="nav-item" *ngFor="let link of navLinks">
                <a class="nav-link d-flex align-items-center" 
                   [routerLink]="link.route"
                   routerLinkActive="active"
                   [routerLinkActiveOptions]="{exact: link.exact}">
                  <i [class]="link.icon + ' me-2'"></i>
                  <span>{{ link.label }}</span>
                </a>
              </li>
            </ul>

            <button class="btn btn-link nav-link" (click)="toggleTheme()">
              <i class="bi" [class.bi-sun]="isDarkTheme" [class.bi-moon]="!isDarkTheme"></i>
            </button>

            <!-- Sidebar Toggle Button -->
            <button class="btn btn-link nav-link" (click)="toggleSidebarVisibility()">
              <i class="bi" [class.bi-layout-sidebar]="!showSidebar" [class.bi-layout-sidebar-inset]="showSidebar"></i>
            </button>

            <app-user-menu [user]="user"></app-user-menu>
          </div>
        </div>
      </div>
    </nav>
  `
})
export class ModernNavbarComponent implements OnInit, OnDestroy {
  @Input() brandName: string = '';
  @Input() user: any;
  @Output() toggleSidebar = new EventEmitter<void>();
  @Output() toggleSidebarVisibilityEvent = new EventEmitter<void>();
  
  isDarkTheme = false;
  isMobileMenuOpen = false;
  showFlyout = false;
  unreadNotifications = 3;
  showSidebar = true;
  
  private subscription = new Subscription();
  
  navLinks = [
    { 
      label: 'Content', 
      route: '/content-viewer', 
      icon: 'bi bi-book',
      exact: false 
    },
    { 
      label: 'Gita Chat - Beta', 
      route: '/chat', 
      icon: 'bi bi-chat',
      exact: true 
    },
    { 
      label: 'Hackathons', 
      route: '/hackathons', 
      icon: 'bi bi-award',
      exact: true 
    },
    { 
      label: 'About Us', 
      route: '/about', 
      icon: 'bi bi-person',
      exact: true 
    }
  ];

  @ViewChild('mobileMenuTrigger') mobileMenuTrigger!: ElementRef;

  logoUrl = 'assets/images/logo.png';
  placeholderLogo = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCAxMDAgMzAiPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMzAiIGZpbGw9IiNlOWVjZWYiLz48dGV4dCB4PSI1MCIgeT0iMTUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzZjNzU3ZCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii40ZW0iPkxvZ288L3RleHQ+PC9zdmc+';

  constructor(
    private themeService: ThemeService,
    private chatbotService: ChatbotService,
    private settingsService: SettingsService,
    private router: Router,
    private elementRef: ElementRef,
    private userPreferences: UserPreferencesService
  ) {
    // Add click outside listener
    document.addEventListener('click', this.onDocumentClick.bind(this));
  }

  ngOnInit(): void {
    // Theme synchronization
    this.subscription.add(
      this.themeService.isDarkTheme$.subscribe((isDark) => {
        this.isDarkTheme = isDark;
        const currentSettingsTheme = this.settingsService.getTheme();
        const newTheme = isDark ? 'dark' : 'light';
        
        if (currentSettingsTheme !== newTheme) {
          this.settingsService.updatePreference('theme', newTheme);
        }
      })
    );
    
    // Settings service sync
    this.subscription.add(
      this.settingsService.getPreferences().subscribe(prefs => {
        const isDarkFromSettings = prefs.theme === 'dark';
        if (this.isDarkTheme !== isDarkFromSettings) {
          this.themeService.setTheme(isDarkFromSettings);
        }
      })
    );
    
    // User preferences sync
    this.subscription.add(
      this.userPreferences.preferences$.subscribe(prefs => {
        this.showSidebar = prefs.showSidebar;
      })
    );
    
    // Auto-close mobile menu on navigation
    this.subscription.add(
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe(() => {
        this.isMobileMenuOpen = false;
      })
    );
  }
  
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    document.removeEventListener('click', this.onDocumentClick.bind(this));
  }
  
  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
  
  toggleChatbot(): void {
    this.chatbotService.toggle();
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  onMobileMenuItemClick(): void {
    this.isMobileMenuOpen = false;
  }

  toggleSidebarVisibility(): void {
    this.userPreferences.toggleSidebarVisibility();
  }

  private onDocumentClick(event: MouseEvent): void {
    // Close mobile menu when clicking outside
    if (this.isMobileMenuOpen) {
      const target = event.target as HTMLElement;
      const isMenuTrigger = this.mobileMenuTrigger?.nativeElement.contains(target);
      const isInsideMenu = this.elementRef.nativeElement.querySelector('.mobile-menu')?.contains(target);
      
      if (!isMenuTrigger && !isInsideMenu) {
        this.isMobileMenuOpen = false;
      }
    }
  }

  onLogoError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    if (imgElement.src !== this.placeholderLogo) {
      imgElement.src = this.placeholderLogo;
    }
  }
} 