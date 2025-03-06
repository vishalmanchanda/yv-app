import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

import { NavbarComponent } from '../../components/navbar/navbar.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';



import { ChatbotComponent } from '../../mfes/chatbot/chatbot.component';

import { UserPreferencesService } from '../../core/services/user-preferences.service';
import { AuthService } from '../../core/auth/auth.service';
import { BreadcrumbService } from '../../core/services/breadcrumb.service';
import { MfeCommunicationService } from '../../core/events/mfe-communication.service';
import { ChatbotService } from '../../mfes/chatbot/chatbot.service';

@Component({
  selector: 'app-shell-layout',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    NavbarComponent,
    SidebarComponent,
    BreadcrumbComponent,
    FooterComponent,
    ChatbotComponent
  ],
  template: `
    <div class="d-flex flex-column min-vh-100">
    <app-navbar 
      [brandName]="'App'" 
      [user]="user" 
      (toggleSidebar)="toggleSidebar()">
    </app-navbar>
    
    <div class="shell-container">
      <app-sidebar 
        [menuItems]="menuItems" 
        [isExpanded]="sidebarExpanded"
        (toggleSidebar)="toggleSidebar()"
        (sidebarStateChanged)="onSidebarStateChanged($event)">
      </app-sidebar>
      
      <main [ngClass]="{'content-area': true, 'sidebar-expanded': sidebarExpanded, 'sidebar-collapsed': !sidebarExpanded}">
        <app-breadcrumb></app-breadcrumb>
        <div class="container-fluid py-3">
          <router-outlet></router-outlet>
        </div>
        <app-footer [appName]="'App'"></app-footer>
      </main>
    </div>
    
    <app-chatbot *ngIf="showChatbot"></app-chatbot>
</div>
  `,
  styles: [`
    .shell-container {
      display: flex;
      height: calc(100vh - 56px);
      margin-top: 56px;
    }
    
    .content-area {
      flex: 1;
      overflow-y: auto;
      transition: margin-left 0.3s ease;
    }
    
    .sidebar-expanded {
      margin-left: 250px;
    }
    
    .sidebar-collapsed {
      margin-left: 70px;
    }
    
    @media (max-width: 768px) {
      .content-area {
        margin-left: 0 !important;
        width: 100%;
      }
    }
  `]
})
export class ShellLayoutComponent implements OnInit, OnDestroy {
  appTitle = 'App';
  appVersion = '1.0.0';
  sidebarExpanded = true;
  user: any;
  private subscriptions = new Subscription();
  
  menuItems = [
    { label: 'Dashboard', icon: 'bi bi-speedometer2', route: '/dashboard' },
    { label: 'MFE Example', icon: 'bi bi-puzzle', route: '/mfe1' },
    { label: 'Documentation', icon: 'bi bi-book', route: '/docs' },
    {
      label: 'User Management',
      icon: 'bi bi-people',
      route: '/users'
    },
    {
      label: 'Features',
      icon: 'bi bi-list-check',
      route: '/features'
    }
  ];
  
  showChatbot = false;
  
  constructor(
    private userPreferences: UserPreferencesService,
    private authService: AuthService,
    private breadcrumbService: BreadcrumbService,
    private mfeCommunication: MfeCommunicationService,
    private chatbotService: ChatbotService
  ) {}
  
  ngOnInit() {
    // Get user preferences
    this.subscriptions.add(
      this.userPreferences.preferences$.subscribe(prefs => {
        this.sidebarExpanded = prefs.sidebarExpanded;
      })
    );
    
    // Get current user
    this.subscriptions.add(
      this.authService.currentUser$.subscribe(user => {
        this.user = user;
      })
    );
    
    // Listen for MFE events
    this.subscriptions.add(
      this.mfeCommunication.on('navigation').subscribe(data => {
        console.log('Navigation event from MFE:', data);
        // Handle navigation events from MFEs
      })
    );
    
    // Add this subscription
    this.subscriptions.add(
      this.chatbotService.visibility$.subscribe(visible => {
        this.showChatbot = visible;
      })
    );
  }
  
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
  
  toggleSidebar() {
    this.userPreferences.toggleSidebar();
  }
  
  onSidebarStateChanged(expanded: boolean) {
    this.sidebarExpanded = expanded;
  }
} 