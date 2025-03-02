import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-user-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dropdown">
      <button class="btn dropdown-toggle user-menu-button" type="button" id="userMenuDropdown" 
              data-bs-toggle="dropdown" aria-expanded="false">
        <img [src]="user?.profileImage || 'assets/images/default-avatar.png'" 
             alt="User Avatar" 
             class="user-avatar">
        <span class="user-name d-none d-md-inline-block">{{ user?.name || 'User' }}</span>
      </button>
      <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userMenuDropdown">
        <li class="dropdown-header">
          <div class="user-info">
            <div class="user-name">{{ user?.name || 'User' }}</div>
            <div class="user-email">{{ user?.email || 'user@example.com' }}</div>
          </div>
        </li>
        <li><hr class="dropdown-divider"></li>
        <li>
          <a class="dropdown-item" routerLink="/profile">
            <i class="bi bi-person me-2"></i> Profile
          </a>
        </li>
        <li>
          <a class="dropdown-item" routerLink="/settings">
            <i class="bi bi-gear me-2"></i> Settings
          </a>
        </li>
        <li>
          <a class="dropdown-item" routerLink="/notifications">
            <i class="bi bi-bell me-2"></i> Notifications
            <span class="badge bg-danger ms-2" *ngIf="unreadNotifications > 0">{{ unreadNotifications }}</span>
          </a>
        </li>
        <li><hr class="dropdown-divider"></li>
        <li>
          <a class="dropdown-item" href="javascript:void(0)" (click)="logout()">
            <i class="bi bi-box-arrow-right me-2"></i> Logout
          </a>
        </li>
      </ul>
    </div>
  `,
  styles: [`
    .user-menu-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.25rem 0.5rem;
      background: transparent;
      border: none;
      color: var(--bs-navbar-color);
    }
    
    .user-menu-button:hover, .user-menu-button:focus {
      color: var(--bs-navbar-hover-color);
      background: rgba(255, 255, 255, 0.1);
    }
    
    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid rgba(255, 255, 255, 0.5);
    }
    
    .dropdown-header {
      padding: 0.5rem 1rem;
    }
    
    .user-info {
      text-align: center;
      padding: 0.5rem 0;
    }
    
    .user-name {
      font-weight: 500;
    }
    
    .user-email {
      font-size: 0.875rem;
      color: var(--bs-secondary-color);
    }
    
    .dropdown-item {
      padding: 0.5rem 1rem;
    }
  `]
})
export class UserMenuComponent {
  @Input() user: any;
  unreadNotifications = 3; // Example value, should come from a service
  
  constructor(
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}
  
  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.notificationService.success('You have been logged out successfully');
      },
      error: (error) => {
        console.error('Logout error:', error);
        this.notificationService.error('There was a problem logging out');
      }
    });
  }
} 