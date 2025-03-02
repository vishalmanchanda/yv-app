import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav [class]="'sidebar ' + (isExpanded ? 'expanded' : 'collapsed')">
      <ul class="nav flex-column">
        @for (item of menuItems; track item.label) {
          <li class="nav-item">
            <a [routerLink]="item.route" 
               routerLinkActive="active"
               class="nav-link"
               (click)="onMenuClick()">
              <i [class]="item.icon"></i>
              <span class="menu-text">{{item.label}}</span>
            </a>
          </li>
        }
      </ul>
    </nav>
  `,
  styles: [`
    .sidebar {
      position: fixed;
      top: 56px;
      bottom: 0;
      left: 0;
      z-index: 100;
      padding: 0;
      box-shadow: inset -1px 0 0 rgba(0, 0, 0, .1);
      background-color: #343a40;
      transition: all 0.3s ease;
    }

    .expanded {
      width: 250px;
    }

    .collapsed {
      width: 70px;
    }

    .nav-link {
      padding: 1rem;
      color: rgba(255,255,255,.75);
      display: flex;
      align-items: center;
      gap: 0.75rem;
      transition: all 0.2s ease;
    }

    .nav-link:hover {
      color: white;
      background: rgba(255,255,255,.1);
    }

    .nav-link.active {
      color: white;
      background: var(--bs-primary);
    }

    .nav-link i {
      font-size: 1.2rem;
      min-width: 24px;
      text-align: center;
    }

    .collapsed .menu-text {
      display: none;
    }

    @media (max-width: 768px) {
      .sidebar {
        transform: translateX(-100%);
        width: 250px;
      }

      .sidebar.expanded {
        transform: translateX(0);
      }

      .collapsed .menu-text {
        display: inline;
      }
    }
  `]
})
export class SidebarComponent {
  @Input() menuItems: any[] = [];
  @Input() isExpanded: boolean = true;
  @Output() toggleSidebar = new EventEmitter<void>();

  onMenuClick() {
    if (window.innerWidth <= 768) {
      this.toggleSidebar.emit();
    }
  }
} 