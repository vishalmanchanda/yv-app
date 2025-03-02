import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar navbar-expand-lg fixed-top navbar-dark bg-primary">
      <div class="container-fluid">
        <button 
          class="btn btn-link sidebar-toggle"
          (click)="toggleSidebar.emit()">
          <i class="bi bi-list fs-4"></i>
        </button>

        <a class="navbar-brand ms-2" href="#">
          {{brandName}}
        </a>

        <button class="navbar-toggler" type="button" 
                (click)="isMenuCollapsed = !isMenuCollapsed"
                data-bs-toggle="collapse" 
                data-bs-target="#navbarContent">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarContent"
             [class.show]="!isMenuCollapsed">
          <ul class="navbar-nav ms-auto">
            <li class="nav-item">
              <a class="nav-link" href="#"><i class="bi bi-bell"></i></a>
            </li>
            <li class="nav-item dropdown">
              <a class="nav-link user-profile dropdown-toggle" 
                 href="#" 
                 role="button" 
                 data-bs-toggle="dropdown">
                <img [src]="user.avatar" [alt]="user.name" class="avatar">
                <span class="ms-2 d-none d-lg-inline">{{user.name}}</span>
              </a>
              <ul class="dropdown-menu dropdown-menu-end">
                <li><a class="dropdown-item" href="#"><i class="bi bi-person me-2"></i>Profile</a></li>
                <li><a class="dropdown-item" href="#"><i class="bi bi-gear me-2"></i>Settings</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item" href="#"><i class="bi bi-box-arrow-right me-2"></i>Logout</a></li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      padding: 0.5rem 1rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .sidebar-toggle {
      color: white;
      padding: 0;
    }

    .avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 2px solid rgba(255,255,255,0.3);
    }

    .user-profile {
      display: flex;
      align-items: center;
    }

    .dropdown-menu {
      margin-top: 0.5rem;
    }

    .dropdown-item i {
      width: 1.2rem;
    }
  `]
})
export class NavbarComponent {
  @Input() brandName: string = '';
  @Input() user: any;
  @Output() toggleSidebar = new EventEmitter<void>();
  isMenuCollapsed = true;
} 