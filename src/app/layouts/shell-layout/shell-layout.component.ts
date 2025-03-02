import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';

@Component({
  selector: 'app-shell-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, SidebarComponent],
  template: `
    <div class="shell-container">
      <app-navbar [brandName]="'Shell App'" [user]="currentUser"></app-navbar>
      <div class="content-wrapper">
        <app-sidebar [menuItems]="sidebarMenu"></app-sidebar>
        <main class="main-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .shell-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }
    .content-wrapper {
      display: flex;
      flex: 1;
    }
    .main-content {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
    }
  `]
})
export class ShellLayoutComponent {
  currentUser = {
    name: 'John Doe',
    avatar: 'https://images.pexels.com/photos/2128819/pexels-photo-2128819.jpeg?auto=compress&cs=tinysrgb'
  };

  sidebarMenu = [
    { 
      label: 'Dashboard', 
      icon: 'dashboard', 
      route: '/dashboard' 
    },
    { 
      label: 'MFE Example', 
      icon: 'apps', 
      route: '/mfe1' 
    }
  ];
} 