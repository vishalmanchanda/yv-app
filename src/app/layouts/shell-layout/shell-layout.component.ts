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
      [brandName]="appTitle" 
      [user]="currentUser" 
      (toggleSidebar)="toggleSidebar()">
    </app-navbar>
    
    <div class="app-container d-flex flex-grow-1" [class.sidebar-expanded]="sidebarExpanded">
      <app-sidebar 
        [menuItems]="menuItems" 
        [isExpanded]="sidebarExpanded"
        (toggleSidebar)="toggleSidebar()">
      </app-sidebar>
      
      <main class="content-area flex-grow-1 px-5 mx-4">
        <app-breadcrumb></app-breadcrumb>
        
        <div class="content-wrapper">
          <router-outlet></router-outlet>
        </div>
        
        <app-footer 
          [appVersion]="appVersion"
          [appName]="appTitle">
        </app-footer>
      </main>
    </div>
    
    <app-chatbot *ngIf="showChatbot"></app-chatbot>
</div>
  `,
  styles: [`
    .app-container {
      display: flex;
      height: 100vh;
      padding-top: 56px;
    }
    
    .content-area {
      flex: 1;
      overflow-y: auto;
      padding: 1rem;
      transition: all 0.3s ease;
      padding-left: 2rem;
      padding-right: 2rem;
    }
    
    .sidebar-expanded .content-area {
      margin-left: 250px;
    }
    
    @media (max-width: 768px) {
      .sidebar-expanded .content-area {
        margin-left: 0;
      }
    }
    
    @media (min-width: 992px) {
      .content-area {
        padding-left: 3rem;
      }
    }
    
    .content-wrapper {
      min-height: calc(100vh - 170px);
      padding: 1rem;
      background: var(--bs-body-bg);
      border-radius: 0.5rem;
      box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
    }
  `]
})
export class ShellLayoutComponent implements OnInit, OnDestroy {
  appTitle = 'Shell App';
  appVersion = '1.0.0';
  sidebarExpanded = true;
  currentUser: any;
  private subscriptions = new Subscription();
  
  menuItems = [
    { label: 'Dashboard', icon: 'bi bi-speedometer2', route: '/dashboard' },
    { label: 'MFE Example', icon: 'bi bi-puzzle', route: '/mfe1' },
    { label: 'Documentation', icon: 'bi bi-book', route: '/docs' }
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
        this.currentUser = user;
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
} 