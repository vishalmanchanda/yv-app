import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserMenuComponent } from '../user-menu/user-menu.component';
import { ThemeService } from '../../core/services/theme.service';
import { ChatbotService } from '../../mfes/chatbot/chatbot.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, UserMenuComponent],
  template: `
    <nav class="navbar navbar-expand-lg fixed-top">
      <div class="container-fluid">
        <button class="navbar-toggler sidebar-toggler me-2" type="button" (click)="onToggleSidebar()">
          <span class="navbar-toggler-icon"></span>
        </button>
        
        <a class="navbar-brand" routerLink="/">{{ brandName }}</a>
        
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent">
          <span class="navbar-toggler-icon"></span>
        </button>
        
        <div class="collapse navbar-collapse" id="navbarContent">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item">
              <a class="nav-link" routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/docs" routerLinkActive="active">Documentation</a>
            </li>
          </ul>
          
          <div class="d-flex align-items-center">
            <div class="theme-toggle me-3">
              <button class="btn btn-sm" (click)="toggleTheme()">
                <i class="bi" [ngClass]="isDarkTheme ? 'bi-sun' : 'bi-moon'"></i>
              </button>
            </div>
            
            <div class="search-box me-3">
              <div class="input-group">
                <input type="text" class="form-control form-control-sm" placeholder="Search...">
                <button class="btn btn-outline-light btn-sm" type="button">
                  <i class="bi bi-search"></i>
                </button>
              </div>
            </div>
            
            <div class="notifications-icon me-3">
              <button class="btn position-relative" routerLink="/notifications">
                <i class="bi bi-bell text-light"></i>
                <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" 
                      *ngIf="unreadNotifications > 0">
                  {{ unreadNotifications }}
                </span>
              </button>
            </div>
            
            <div class="me-3">
              <button class="btn btn-sm btn-outline-light" (click)="toggleChatbot()">
                <i class="bi bi-chat-dots"></i> Support
              </button>
            </div>
            
            <app-user-menu [user]="user"></app-user-menu>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      padding: 0.5rem 1rem;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      background-color: var(--bs-primary);
      transition: background-color 0.3s ease, color 0.3s ease;
    }
    
    .sidebar-toggler {
      border: none;
      padding: 0.25rem;
      color: var(--bs-navbar-color);
    }
    
    .theme-toggle .btn {
      color: var(--bs-navbar-color);
      background: transparent;
      border: none;
      padding: 0.25rem;
      font-size: 1.25rem;
    }
    
    .theme-toggle .btn:hover {
      color: var(--bs-navbar-hover-color);
    }
    
    .search-box .form-control {
      background-color: rgba(var(--bs-navbar-color-rgb), 0.2);
      border: none;
      color: var(--bs-navbar-color);
    }
    
    .search-box .form-control::placeholder {
      color: rgba(var(--bs-navbar-color-rgb), 0.7);
    }
    
    .search-box .btn {
      border-color: rgba(var(--bs-navbar-color-rgb), 0.2);
      color: var(--bs-navbar-color);
    }
    
    .notifications-icon .btn {
      color: var(--bs-navbar-color);
      font-size: 1.25rem;
      padding: 0.25rem;
    }
  `]
})
export class NavbarComponent {
  @Input() brandName: string = 'Yoga Vivek';
  @Input() user: any;
  @Output() toggleSidebar = new EventEmitter<void>();
  
  unreadNotifications = 3; // Example value, should come from a service
  isDarkTheme = false;
  
  constructor(
    private themeService: ThemeService,
    private chatbotService: ChatbotService
  ) {
    this.themeService.isDarkTheme$.subscribe((isDark) => {
      this.isDarkTheme = isDark;
    });
  }
  
  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }
  
  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
  
  toggleChatbot(): void {
    this.chatbotService.toggle();
  }
}