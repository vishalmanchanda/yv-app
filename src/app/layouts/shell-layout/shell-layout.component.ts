import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-shell-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, SidebarComponent, CommonModule],
  template: `
    <div class="wrapper">
      <app-navbar 
        [brandName]="'Shell App'" 
        [user]="currentUser"
        (toggleSidebar)="toggleSidebar()"
      ></app-navbar>
      
      <div class="container-fluid">
        <div class="row">
          <app-sidebar 
            [menuItems]="sidebarMenu" 
            [isExpanded]="sidebarExpanded"
            (toggleSidebar)="toggleSidebar()"
            class="col-auto px-0"
          ></app-sidebar>
          
          <main [class]="'col px-md-4 py-4 ' + (sidebarExpanded ? 'main-expanded' : 'main-collapsed')">
            <router-outlet></router-outlet>
          </main>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .wrapper {
      min-height: 100vh;
      background-color: #f8f9fa;
    }

    main {
      transition: margin-left 0.3s ease;
      margin-top: 56px;
    }

    .main-expanded {
      @media (min-width: 992px) {
        margin-left: 250px;
      }
    }

    .main-collapsed {
      @media (min-width: 992px) {
        margin-left: 70px;
      }
    }
  `]
})
export class ShellLayoutComponent {
  sidebarExpanded = true;
  currentUser = {
    name: 'John Doe',
    avatar: 'https://ui-avatars.com/api/?name=John+Doe',
    role: 'Administrator'
  };

  sidebarMenu = [
    { 
      label: 'Dashboard', 
      icon: 'bi bi-speedometer2', 
      route: '/dashboard' 
    },
    { 
      label: 'MFE Example', 
      icon: 'bi bi-grid', 
      route: '/mfe1' 
    },
    { 
      label: 'Analytics', 
      icon: 'bi bi-graph-up', 
      route: '/analytics' 
    },
    { 
      label: 'Settings', 
      icon: 'bi bi-gear', 
      route: '/settings' 
    }
  ];

  toggleSidebar() {
    this.sidebarExpanded = !this.sidebarExpanded;
  }
} 