import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LoaderService } from '../../core/services/loader.service';
import { NotificationService } from '../../core/services/notification.service';
import { ConfigService } from '../../core/services/config.service';
import { WebSocketService } from '../../core/services/websocket.service';
import { UserPreferencesService } from '../../core/services/user-preferences.service';
import { UiFacade } from '../../core/store/facades/ui.facade';
import { ShellLayoutComponent } from "../../layouts/shell-layout/shell-layout.component";

@Component({
  selector: 'app-documentation',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ShellLayoutComponent],
  
  templateUrl: './documentation.component.html',
  styles: [`
    .docs-container {
      display: flex;
      height: calc(100vh - 64px);
      background: var(--bg-primary);
    }

    .docs-sidebar {
      width: 250px;
      background: var(--card-bg);
      border-right: 1px solid var(--border-color);
      padding: 1rem;
    }

    .docs-content {
      flex: 1;
      padding: 2rem;
      overflow-y: auto;
    }

    .nav-link {
      color: var(--text-primary);
      cursor: pointer;
      padding: 0.75rem 1rem;
      border-radius: 6px;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .nav-link:hover {
      background: var(--bg-secondary);
    }

    .nav-link.active {
      background: var(--bs-primary);
      color: white;
    }

    .feature-demo {
      max-width: 800px;
    }

    .demo-card {
      background: var(--card-bg);
      padding: 1.5rem;
      border-radius: 8px;
      margin-top: 1.5rem;
    }

    .code-example {
      background: var(--bg-secondary);
      padding: 1rem;
      border-radius: 6px;
    }

    pre {
      margin: 0;
      padding: 1rem;
      background: var(--bg-primary);
      border-radius: 4px;
      color: var(--text-primary);
    }

    .lead {
      color: var(--text-secondary);
    }

    .status-display {
      font-size: 1.1rem;
    }

    .preferences-display {
      max-height: 200px;
      overflow-y: auto;
    }

    h2 {
      color: var(--text-primary);
      margin-bottom: 1rem;
    }

    h4 {
      color: var(--text-secondary);
      margin-bottom: 1rem;
    }

    .btn-group {
      gap: 0.5rem;
    }
  `]
})
export class DocumentationComponent {
  sections = [
    { id: 'notifications', title: 'Notifications', icon: 'bi-bell' },
    { id: 'config', title: 'Configuration', icon: 'bi-gear' },
    { id: 'websocket', title: 'WebSocket', icon: 'bi-wifi' },
    { id: 'state', title: 'State Management', icon: 'bi-diagram-3' },
    { id: 'preferences', title: 'User Preferences', icon: 'bi-person-gear' },
    { id: 'routing', title: 'Routing', icon: 'bi-signpost-split' },
    { id: 'theming', title: 'Theming', icon: 'bi-palette' },
    
  ];

  themeColors = [
    'bg-primary',
    'bg-secondary',
    'text-primary',
    'text-secondary',
    'border-color'
  ];

  routeConfig = {
    path: '',
    component: 'ShellLayoutComponent',
    children: [
      {
        path: 'docs',
        loadComponent: 'DocumentationComponent'
      },
      {
        path: 'example',
        loadComponent: 'ExampleComponent'
      }
    ]
  };

  activeSection = 'notifications';

  readonly currentConfig;
  readonly wsStatus$;
  readonly theme$;
  readonly sidebarExpanded$;
  readonly userPreferences$;

  
  constructor(
    private notificationService: NotificationService,
    private configService: ConfigService,
    private wsService: WebSocketService,
    private uiFacade: UiFacade,
    private preferencesService: UserPreferencesService
  ) {
    this.currentConfig = this.configService.getConfig();
    this.wsStatus$ = this.wsService.status$;
    this.theme$ = this.uiFacade.theme$;
    this.sidebarExpanded$ = this.uiFacade.sidebarExpanded$;
    this.userPreferences$ = this.preferencesService.preferences$;
  }

  setActiveSection(sectionId: string) {
    this.activeSection = sectionId;
  }

  showNotification(type: string) {
    switch (type) {
      case 'success':
        this.notificationService.success('Success notification example');
        break;
      case 'info':
        this.notificationService.info('Info notification example');
        break;
      case 'warning':
        this.notificationService.warning('Warning notification example');
        break;
      case 'error':
        this.notificationService.error('Error notification example');
        break;
    }
  }

  sendTestMessage() {
    this.wsService.simulateIncomingMessage('notification', {
      message: 'Test WebSocket message'
    });
  }

  toggleTheme() {
    const currentTheme = this.uiFacade.theme$;
    currentTheme.subscribe(theme => {
      this.uiFacade.setTheme(theme === 'light' ? 'dark' : 'light');
    }).unsubscribe();
  }

  toggleSidebar() {
    this.uiFacade.toggleSidebar();
  }

  resetPreferences() {
    this.preferencesService.resetPreferences();
    this.notificationService.success('Preferences reset to defaults');
  }
} 