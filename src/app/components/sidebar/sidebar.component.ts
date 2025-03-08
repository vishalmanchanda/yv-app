import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav [class]="'sidebar ' + (isExpanded ? 'expanded' : 'collapsed')"
         (mouseenter)="onMouseEnter()"
         (mouseleave)="onMouseLeave()">
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
      z-index: 1200;
      padding: 0;
      box-shadow: inset -1px 0 0 rgba(0, 0, 0, .1);
      background-color: var(--bs-tertiary-bg);
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
      color: var(--bs-body-color);
      display: flex;
      align-items: center;
      gap: 0.75rem;
      transition: all 0.2s ease;
    }

    .nav-link:hover {
      color: var(--bs-primary);
      background: var(--bs-tertiary-bg);
    }

    .nav-link.active {
      color: var(--bs-primary);
      background: var(--bs-secondary-bg);
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
export class SidebarComponent implements OnInit, OnDestroy {
  @Input() menuItems: any[] = [];
  @Input() isExpanded: boolean = true;
  @Output() toggleSidebar = new EventEmitter<void>();
  @Output() sidebarStateChanged = new EventEmitter<boolean>();
  
  private resizeHandler: () => void;
  private isDesktop = false;
  private isHovering = false;

  constructor() {
    this.resizeHandler = () => this.checkScreenSize();
  }

  ngOnInit() {
    this.checkScreenSize();
    window.addEventListener('resize', this.resizeHandler);
    
    // Emit initial state to parent component
    this.sidebarStateChanged.emit(this.isExpanded);
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.resizeHandler);
  }

  checkScreenSize() {
    this.isDesktop = window.innerWidth > 768;
    
    // On mobile, we don't auto-expand
    if (!this.isDesktop) {
      const wasExpanded = this.isExpanded;
      if (wasExpanded !== this.isExpanded) {
        this.sidebarStateChanged.emit(this.isExpanded);
      }
    }
  }

  onMouseEnter() {
    if (this.isDesktop && !this.isExpanded) {
      this.isHovering = true;
      this.isExpanded = true;
      this.sidebarStateChanged.emit(true);
    }
  }

  onMouseLeave() {
    if (this.isDesktop && this.isHovering) {
      this.isHovering = false;
      this.isExpanded = false;
      this.sidebarStateChanged.emit(false);
    }
  }

  onMenuClick() {
    if (window.innerWidth <= 768) {
      this.toggleSidebar.emit();
    }
  }
} 