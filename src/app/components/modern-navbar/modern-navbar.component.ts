import { Component, EventEmitter, Input, Output, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
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
  templateUrl: './modern-navbar.component.html',
  styleUrls: ['./modern-navbar.component.scss']
})
export class ModernNavbarComponent implements OnInit, OnDestroy {
  @Input() brandName: string = '';
  @Input() user: any;
  @Output() toggleSidebar = new EventEmitter<void>();
  
  isDarkTheme = false;
  isMobileMenuOpen = false;
  showFlyout = false;
  unreadNotifications = 3;
  
  private subscription = new Subscription();
  
  navLinks = [
    { 
      label: 'Content', 
      route: '/content-viewer', 
      icon: 'bi bi-book',
      exact: false 
    },
    { 
      label: 'Chat', 
      route: '/chat', 
      icon: 'bi bi-chat',
      exact: true 
    },
    { 
      label: 'Hackathons', 
      route: '/hackathons', 
      icon: 'bi bi-list-check',
      exact: true 
    },
    { 
      label: 'About Us', 
      route: '/about-us', 
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
    private elementRef: ElementRef
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