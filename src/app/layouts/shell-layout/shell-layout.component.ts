import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

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
import { ModernNavbarComponent } from '../../components/modern-navbar/modern-navbar.component';
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
    ChatbotComponent,
    ModernNavbarComponent
  ],
  template: `
    <div class="d-flex flex-column min-vh-100">
    <!-- <app-navbar 
      [brandName]="'Yoga Vivek'" 
      [user]="user" 
      (toggleSidebar)="toggleSidebar()">
    </app-navbar> -->

    <app-modern-navbar
      [brandName]="'Yoga Vivek'"
      [user]="user"
      (toggleSidebar)="toggleSidebar()"

    ></app-modern-navbar>
    
    <div class="shell-container">
      <app-sidebar 
        *ngIf="showSidebar"
        [menuItems]="menuItems" 
        [isExpanded]="sidebarExpanded"
        (toggleSidebar)="toggleSidebar()"
        (sidebarStateChanged)="onSidebarStateChanged($event)">
      </app-sidebar>
      
      <main [ngClass]="{
        'content-area': true, 
        'sidebar-expanded': showSidebar && sidebarExpanded, 
        'sidebar-collapsed': showSidebar && !sidebarExpanded,
        'no-sidebar': !showSidebar
      }">
        <app-breadcrumb></app-breadcrumb>
        <div class="content-wrapper">
          <div class="container-fluid py-3">
            <router-outlet></router-outlet>
          </div>
          <app-footer [appName]="'Yoga Vivek'"></app-footer>
        </div>
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
      display: flex;
      flex-direction: column;
      transition: margin-left 0.3s ease;
    }
    
    .content-wrapper {
      flex: 1;
      overflow-y: auto;
      position: relative;
    }
    
    .sidebar-expanded {
      margin-left: 250px;
    }
    
    .sidebar-collapsed {
      margin-left: 70px;
    }

    .no-sidebar {
      margin-left: 0 !important;
    }
    
    @media (max-width: 768px) {
      .content-area {
        margin-left: 0 !important;
        width: 100%;
      }
    }

    @media (min-width: 769px) and (max-width: 1024px) {
      .content-area {
        margin-left: 0;
      }
      .sidebar-expanded {
        margin-left: 250px;
      }
    }
  `]
})
export class ShellLayoutComponent implements OnInit, OnDestroy {
  appTitle = 'Yoga Vivek';
  appVersion = '1.0.0';
  sidebarExpanded = true;
  showSidebar = true;
  user: any;
  private subscriptions = new Subscription();
  
  menuItems = [
    { label: 'Home', icon: 'bi bi-house', route: '/content-viewer' },
    { label: 'Gita Chat - Beta', icon: 'bi bi-chat', route: '/chat' },    
    { label: 'Hackathons', icon: 'bi bi-award', route: '/hackathons' }, 
    { label: 'About Us', icon: 'bi bi-person', route: '/about' }
  ];
  
  showChatbot = false;
  
  constructor(
    private userPreferences: UserPreferencesService,
    private authService: AuthService,
    private breadcrumbService: BreadcrumbService,
    private mfeCommunication: MfeCommunicationService,
    private chatbotService: ChatbotService,
    private router: Router
  ) {
    // Check route data to determine if sidebar should be shown
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      const currentRoute = this.router.routerState.snapshot.root;
      let child = currentRoute.firstChild;
      
      // First check route data
      let routeHideSidebar = false;
      while (child) {
        if (child.data['hideSidebar'] !== undefined) {
          routeHideSidebar = child.data['hideSidebar'];
          break;
        }
        child = child.firstChild;
      }

      // Only update if route doesn't specify hideSidebar
      if (!routeHideSidebar) {
        this.showSidebar = this.userPreferences.getPreference('showSidebar');
      } else {
        this.showSidebar = false;
      }
    });
  }
  
  ngOnInit() {
    // Get user preferences
    this.subscriptions.add(
      this.userPreferences.preferences$.subscribe(prefs => {
        this.sidebarExpanded = prefs.sidebarExpanded;
        // Only update showSidebar if route doesn't specify hideSidebar
        const currentRoute = this.router.routerState.snapshot.root;
        let child = currentRoute.firstChild;
        let routeHideSidebar = false;
        
        while (child) {
          if (child.data['hideSidebar'] !== undefined) {
            routeHideSidebar = child.data['hideSidebar'];
            break;
          }
          child = child.firstChild;
        }
        
        if (!routeHideSidebar) {
          this.showSidebar = prefs.showSidebar;
        }
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
    if (this.showSidebar) {
      this.userPreferences.toggleSidebar();
    }
  }
  
  toggleSidebarVisibility() {
    this.userPreferences.toggleSidebarVisibility();
  }
  
  onSidebarStateChanged(expanded: boolean) {
    this.sidebarExpanded = expanded;
  }
} 