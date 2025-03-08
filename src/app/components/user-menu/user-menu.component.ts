import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-user-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.scss']
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

  onImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.style.display = 'none';
    imgElement.parentElement?.querySelector('.avatar-placeholder')?.classList.add('show');
  }
} 