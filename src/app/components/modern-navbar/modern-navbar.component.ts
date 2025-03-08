import { Component, EventEmitter, Input, Output, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { ChatbotService } from '../../mfes/chatbot/chatbot.service';
import { SettingsService } from '../../mfes/content-renderer/services/settings.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { UserMenuComponent } from '../user-menu/user-menu.component';

@Component({
  selector: 'app-modern-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, UserMenuComponent],
  template: `
    <nav class="navbar navbar-expand-lg fixed-top" [class.light-theme]="!isDarkTheme" [class.dark-theme]="isDarkTheme">
      <div class="container-fluid">
        <!-- Mobile Toggle Button moved before brand -->
        <button class="navbar-toggler d-lg-none me-2" type="button" (click)="toggleSidebar.emit()">
          <i class="fas fa-bars"></i>
        </button>
        
        <a class="navbar-brand" routerLink="/">{{ brandName }}</a>
        
        <!-- Mobile Menu Button (separate from sidebar toggle) -->
        <button class="navbar-toggler d-lg-none ms-auto me-2" type="button" (click)="isMobileMenuOpen = !isMobileMenuOpen">
          <i class="fas fa-ellipsis-v"></i>
        </button>

        <!-- Mobile Controls Dropdown -->
        <div class="mobile-controls-dropdown dropdown d-lg-none">
          <button class="btn dropdown-toggle" type="button" id="mobileControlsDropdown" data-bs-toggle="dropdown" aria-expanded="false">
            <i class="fas fa-cog"></i>
          </button>
          <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="mobileControlsDropdown">
            <li>
              <a class="dropdown-item" (click)="toggleTheme()">
                <i class="fas" [class.fa-sun]="!isDarkTheme" [class.fa-moon]="isDarkTheme"></i>
                <span class="ms-2">{{ isDarkTheme ? 'Light Mode' : 'Dark Mode' }}</span>
              </a>
            </li>
            <li>
              <a class="dropdown-item" href="#">
                <i class="fas fa-bell"></i>
                <span class="ms-2">Notifications</span>
                <span *ngIf="unreadNotifications > 0" class="badge bg-danger ms-2">{{unreadNotifications}}</span>
              </a>
            </li>
            <li>
              <a class="dropdown-item" (click)="toggleChatbot()">
                <i class="fas fa-robot"></i>
                <span class="ms-2">Support</span>
              </a>
            </li>
          </ul>
        </div>

        <!-- Mobile Menu - Collapsible -->
        <div class="mobile-menu-collapse" [class.show]="isMobileMenuOpen">
          <div class="mobile-menu-links">
            <a *ngFor="let item of navLinks" 
               class="mobile-nav-link" 
               [routerLink]="item.route" 
               routerLinkActive="active"
               [routerLinkActiveOptions]="{exact: item.exact ?? false}"
               (click)="isMobileMenuOpen = false">
               <i *ngIf="item.icon" class="fas {{item.icon}} me-2"></i>
               {{item.label}}
            </a>
            
            <hr class="mobile-divider">
            
            <!-- Product Features in Mobile Menu -->
            <div *ngIf="menuItems?.product" class="mobile-product-features">
              <div class="mobile-menu-header">Product Features</div>
              <a *ngFor="let feature of menuItems.product.features" 
                 class="mobile-feature-link">
                <i class="fas {{feature.icon}} me-2"></i>
                {{feature.title}}
              </a>
            </div>
          </div>
        </div>

        <div class="nav-buttons d-flex align-items-center ms-auto">
          <!-- Desktop only controls -->
          <div class="d-none d-lg-flex align-items-center">
            <!-- Theme Toggle -->
            <button class="btn theme-toggle me-3" (click)="toggleTheme()">
              <i class="fas" [class.fa-sun]="!isDarkTheme" [class.fa-moon]="isDarkTheme"></i>
            </button>

            <!-- Notifications -->
            <div class="notifications-icon me-3">
              <button class="btn position-relative">
                <i class="fas fa-bell"></i>
                <span *ngIf="unreadNotifications > 0" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {{unreadNotifications}}
                </span>
              </button>
            </div>

            <!-- Chatbot Toggle -->
            <button class="btn chatbot-toggle me-3" (click)="toggleChatbot()">
              <i class="fas fa-robot"></i>
            </button>
          </div>

          <!-- Product Dropdown -->
          <div *ngIf="menuItems?.product" class="nav-item dropdown product-dropdown d-none d-lg-block" (mouseover)="showFlyout = true" (mouseleave)="showFlyout = false">
            <button class="btn dropdown-toggle">
              Product
            </button>
            
            <!-- Flyout Menu -->
            <div class="flyout-menu" [class.show]="showFlyout">
              <div class="container">
                <div class="row g-4">
                  <div class="col-md-4" *ngFor="let feature of menuItems.product.features">
                    <div class="feature-item">
                      <div class="icon-wrapper">
                        <i class="fas {{feature.icon}}"></i>
                      </div>
                      <h5>{{feature.title}}</h5>
                      <p>{{feature.description}}</p>
                    </div>
                  </div>
                </div>
                <div class="row mt-4">
                  <div class="col-6">
                    <button class="btn btn-outline-primary w-100">
                      <i class="fas fa-play-circle me-2"></i>Watch demo
                    </button>
                  </div>
                  <div class="col-6">
                    <button class="btn btn-primary w-100">
                      <i class="fas fa-phone me-2"></i>Contact sales
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Regular Nav Items -->
          <div class="regular-nav-links d-none d-lg-flex">
            <a *ngFor="let item of navLinks" 
               class="nav-link mx-3" 
               [routerLink]="item.route" 
               routerLinkActive="active"
               [routerLinkActiveOptions]="{exact: item.exact ?? false}">
               {{item.label}}
            </a>
          </div>

          <!-- User Menu Component -->
          <app-user-menu *ngIf="user" [user]="user"></app-user-menu>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    /* Theme-specific styles */
    .navbar.light-theme {
      background-color: var(--bs-white);
      color: var(--bs-dark);
    }
    
    .navbar.dark-theme {
      background-color: var(--bs-dark);
      color: var(--bs-white);
    }

    .navbar {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--bs-border-color);
      transition: all 0.3s ease;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }

    .navbar-brand {
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    
    .light-theme .navbar-brand {
      color: var(--bs-dark);
    }
    
    .dark-theme .navbar-brand {
      color: var(--bs-white);
    }

    .navbar-toggler {
      border: none;
      padding: 0.5rem;
      
      &:focus {
        box-shadow: none;
      }
    }
    
    .light-theme .navbar-toggler {
      color: var(--bs-dark);
    }
    
    .dark-theme .navbar-toggler {
      color: var(--bs-white);
    }

    .nav-link {
      transition: color 0.3s ease;
      font-weight: 500;
    }
    
    .light-theme .nav-link {
      color: var(--bs-dark);
      
      &:hover, &.active {
        color: var(--bs-primary);
      }
    }
    
    .dark-theme .nav-link {
      color: var(--bs-white);
      
      &:hover, &.active {
        color: var(--bs-primary);
      }
    }

    .btn {
      transition: all 0.3s ease;
    }
    
    .light-theme .btn {
      color: var(--bs-dark);
      
      &:hover {
        color: var(--bs-primary);
      }
    }
    
    .dark-theme .btn {
      color: var(--bs-white);
      
      &:hover {
        color: var(--bs-primary);
      }
    }

    /* Mobile Controls Dropdown */
    .mobile-controls-dropdown {
      margin-right: 0.5rem;
    }
    
    .mobile-controls-dropdown .dropdown-toggle {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .light-theme .mobile-controls-dropdown .dropdown-toggle:hover {
      background-color: var(--bs-light);
    }
    
    .dark-theme .mobile-controls-dropdown .dropdown-toggle:hover {
      background-color: var(--bs-gray-800);
    }

    /* Mobile Menu Styles */
    .mobile-menu-collapse {
      position: fixed;
      top: 70px; /* adjust based on navbar height */
      left: 0;
      right: 0;
      background-color: var(--bs-body-bg);
      border-bottom: 1px solid var(--bs-border-color);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease;
      z-index: 1050;
      
      &.show {
        max-height: calc(100vh - 70px);
        overflow-y: auto;
      }
    }
    
    .light-theme .mobile-menu-collapse {
      background-color: var(--bs-white);
    }
    
    .dark-theme .mobile-menu-collapse {
      background-color: var(--bs-dark);
    }
    
    .mobile-menu-links {
      padding: 1rem;
      display: flex;
      flex-direction: column;
    }
    
    .mobile-nav-link {
      padding: 0.85rem 1rem;
      color: var(--bs-body-color);
      text-decoration: none;
      font-weight: 500;
      border-radius: 8px;
      display: flex;
      align-items: center;
      
      &:hover, &.active {
        background-color: var(--bs-secondary-bg);
        color: var(--bs-primary);
      }
    }
    
    .mobile-divider {
      margin: 1rem 0;
      opacity: 0.2;
    }
    
    .mobile-menu-header {
      padding: 0.5rem 1rem;
      color: var(--bs-secondary-color);
      font-size: 0.875rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .mobile-feature-link {
      padding: 0.75rem 1rem;
      color: var(--bs-body-color);
      text-decoration: none;
      display: flex;
      align-items: center;
      border-radius: 8px;
      
      &:hover {
        background-color: var(--bs-secondary-bg);
      }
    }

    .product-dropdown {
      position: relative;
    }

    .flyout-menu {
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      background-color: var(--bs-body-bg);
      border: 1px solid var(--bs-border-color);
      border-radius: 12px;
      padding: 2rem;
      width: 800px;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
      margin-top: 1rem;
      z-index: 1100;

      &.show {
        opacity: 1;
        visibility: visible;
      }
    }

    .feature-item {
      padding: 1rem;
      border-radius: 8px;
      transition: all 0.3s ease;
      cursor: pointer;

      &:hover {
        background-color: var(--bs-secondary-bg);
        transform: translateY(-2px);
      }

      .icon-wrapper {
        width: 40px;
        height: 40px;
        border-radius: 8px;
        background-color: var(--bs-primary);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 1rem;
      }

      h5 {
        color: var(--bs-body-color);
        margin-bottom: 0.5rem;
        font-weight: 600;
      }

      p {
        color: var(--bs-secondary-color);
        font-size: 0.875rem;
        margin: 0;
      }
    }

    .theme-toggle,
    .chatbot-toggle {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    }
    
    .light-theme .theme-toggle:hover,
    .light-theme .chatbot-toggle:hover {
      background-color: var(--bs-light);
    }
    
    .dark-theme .theme-toggle:hover,
    .dark-theme .chatbot-toggle:hover {
      background-color: var(--bs-gray-800);
    }

    .notifications-icon .btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .light-theme .notifications-icon .btn:hover {
      background-color: var(--bs-light);
    }
    
    .dark-theme .notifications-icon .btn:hover {
      background-color: var(--bs-gray-800);
    }

    @media (max-width: 992px) {
      .flyout-menu {
        width: 100%;
        left: 0;
        transform: none;
      }
      
      .nav-buttons {
        gap: 0.5rem;
      }
    }
  `]
})
export class ModernNavbarComponent implements OnInit, OnDestroy {
  @Input() brandName: string = 'Yoga Vivek';
  @Input() user: any;
  @Input() navLinks: {label: string, route: string, icon?: string, exact?: boolean}[] = [
    {label: 'Features', route: '/features', icon: 'fa-star', exact: false},
    {label: 'Marketplace', route: '/marketplace', icon: 'fa-store', exact: false},
    {label: 'Company', route: '/company', icon: 'fa-building', exact: false}
  ];
  @Input() menuItems: any = {
    product: {
      features: [
        {icon: 'fa-chart-line', title: 'Analytics', description: 'Get a better understanding of your traffic'},
        {icon: 'fa-comments', title: 'Engagement', description: 'Speak directly to your customers'},
        {icon: 'fa-shield-alt', title: 'Security', description: 'Your customers\' data will be safe and secure'},
        {icon: 'fa-puzzle-piece', title: 'Integrations', description: 'Connect with third-party tools'},
        {icon: 'fa-robot', title: 'Automations', description: 'Build strategic funnels that will convert'}
      ]
    }
  };
  @Output() toggleSidebar = new EventEmitter<void>();
  
  unreadNotifications = 3;
  isDarkTheme = false;
  showFlyout = false;
  isMobileMenuOpen = false;
  
  private subscription = new Subscription();
  
  constructor(
    private themeService: ThemeService,
    private chatbotService: ChatbotService,
    private settingsService: SettingsService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    // Subscribe to ThemeService changes
    this.subscription.add(
      this.themeService.isDarkTheme$.subscribe((isDark) => {
        this.isDarkTheme = isDark;
        
        // Sync with SettingsService
        const currentSettingsTheme = this.settingsService.getTheme();
        const newTheme = isDark ? 'dark' : 'light';
        
        if (currentSettingsTheme !== newTheme) {
          this.settingsService.updatePreference('theme', newTheme);
        }
      })
    );
    
    // Subscribe to SettingsService changes 
    this.subscription.add(
      this.settingsService.getPreferences().subscribe(prefs => {
        const isDarkFromSettings = prefs.theme === 'dark';
        
        // Only update if there's a mismatch
        if (this.isDarkTheme !== isDarkFromSettings) {
          this.themeService.setTheme(isDarkFromSettings);
        }
      })
    );
    
    // Listen for route changes to close mobile menu
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
  }
  
  toggleTheme(): void {
    this.themeService.toggleTheme();
    // No need to update settingsService here since the subscription will handle it
  }
  
  toggleChatbot(): void {
    this.chatbotService.toggle();
  }
} 