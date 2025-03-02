import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoaderService } from '../../core/services/loader.service';
import { NotificationService } from '../../core/services/notification.service';
import { ConfigService, AppConfig } from '../../core/services/config.service';
import { BreadcrumbService } from '../../core/services/breadcrumb.service';
import { UserPreferencesService, UserPreferences } from '../../core/services/user-preferences.service';
import { SearchService, SearchResult } from '../../core/services/search.service';
import { PreferencesPanelComponent } from '../../shared/components/preferences-panel/preferences-panel.component';
import { SearchComponent } from '../../shared/components/search/search.component';
import { HttpClient } from '@angular/common/http';
import { WebSocketMessage, WebSocketService } from '../../core/services/websocket.service';
import { WebSocketStatusComponent } from '../../shared/components/websocket-status/websocket-status.component';

@Component({
  selector: 'mfe1-example',
  standalone: true,
  imports: [CommonModule, FormsModule, PreferencesPanelComponent, SearchComponent, WebSocketStatusComponent],
  template: `
    <div class="mfe-container">
      <div class="feature-card mb-4">
        <h3>Breadcrumb Demo</h3>
        <div class="btn-group">
          <button (click)="updateBreadcrumb('Feature A')" class="btn btn-outline-primary me-2">
            Show Feature A
          </button>
          <button (click)="updateBreadcrumb('Feature B')" class="btn btn-outline-primary me-2">
            Show Feature B
          </button>
          <button (click)="updateBreadcrumb('Feature C')" class="btn btn-outline-primary">
            Show Feature C
          </button>
        </div>
      </div>

      <div class="feature-card mb-4">
        <h3>User Preferences Demo</h3>
        <div class="row">
          <div class="col-md-6">
            <div class="current-preferences">
              <h4>Current Preferences:</h4>
              <ul class="list-unstyled">
                <li>
                  <strong>Theme:</strong> {{ (preferences$ | async)?.theme }}
                </li>
                <li>
                  <strong>Font Size:</strong> {{ (preferences$ | async)?.fontSize }}
                </li>
                <li>
                  <strong>Sidebar:</strong> 
                  {{ (preferences$ | async)?.sidebarExpanded ? 'Expanded' : 'Collapsed' }}
                </li>
              </ul>
              <button class="btn btn-primary" (click)="togglePreferencesPanel()">
                {{ showPreferences ? 'Hide' : 'Show' }} Preferences Panel
              </button>
            </div>
          </div>
          <div class="col-md-6">
            @if (showPreferences) {
              <app-preferences-panel></app-preferences-panel>
            }
          </div>
        </div>
      </div>

      <div class="feature-card">
        <h2>Embedded MFE 1</h2>
        <div class="feature-card">
          <h3>Feature Overview</h3>
          <p>This is an embedded microfrontend that can be extracted later.</p>
          
          <div class="demo-controls">
            <button (click)="simulateLoading()" class="btn btn-primary me-2">
              Simulate Loading
            </button>
            <button (click)="counter = counter + 1" class="btn btn-secondary me-2">
              Count: {{ counter }}
            </button>
            <div class="mt-3">
              <button (click)="simulateError('runtime')" class="btn btn-danger me-2">
                Runtime Error
              </button>
              <button (click)="simulateError('http')" class="btn btn-warning me-2">
                HTTP Error
              </button>
              <button (click)="simulateError('custom')" class="btn btn-info me-2">
                Custom Error
              </button>
            </div>

            <div class="config-info mt-4">
              <h4>Current Configuration:</h4>
              <pre class="config-display">{{ currentConfig | json }}</pre>
              <div class="mt-2">
                <strong>Feature Flags:</strong>
                <ul class="list-unstyled">
                  <li>
                    <i class="bi" [class.bi-check-circle-fill]="isFeatureEnabled('darkMode')" 
                       [class.bi-x-circle-fill]="!isFeatureEnabled('darkMode')"></i>
                    Dark Mode
                  </li>
                  <li>
                    <i class="bi" [class.bi-check-circle-fill]="isFeatureEnabled('notifications')"
                       [class.bi-x-circle-fill]="!isFeatureEnabled('notifications')"></i>
                    Notifications
                  </li>
                  <li>
                    <i class="bi" [class.bi-check-circle-fill]="isFeatureEnabled('analytics')"
                       [class.bi-x-circle-fill]="!isFeatureEnabled('analytics')"></i>
                    Analytics
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Search Testing Section -->
      <div class="feature-card mb-4">
        <h3>Search Testing</h3>
        <div class="row">
          <div class="col-md-6">
            <div class="search-test-controls">
              <button class="btn btn-primary mb-2" (click)="testSearch('dashboard')">
                Search "Dashboard"
              </button>
              <button class="btn btn-primary mb-2" (click)="testSearch('settings')">
                Search "Settings"
              </button>
              <button class="btn btn-danger mb-2" (click)="clearSearchHistory()">
                Clear History
              </button>
            </div>
            
            <div class="search-history mt-3">
              <h4>Search History</h4>
              @if (searchHistory$ | async; as history) {
                <ul class="list-unstyled">
                  @for (item of history; track item.query) {
                    <li class="history-item">
                      <span class="query">{{ item.query }}</span>
                      <span class="count">({{ item.resultCount }} results)</span>
                      <small class="time">{{ item.timestamp | date:'short' }}</small>
                    </li>
                  }
                </ul>
              }
            </div>
          </div>
          
          <div class="col-md-6">
            <div class="local-search">
              <h4>Local Search</h4>
              <app-search></app-search>
            </div>
          </div>
        </div>
      </div>

      <!-- WebSocket Testing Section -->
      <div class="feature-card mb-4">
        <h3>WebSocket Testing</h3>
        <div class="row">
          <div class="col-md-6">
            <div class="ws-controls">
              <app-websocket-status class="mb-3"></app-websocket-status>
              
              <button class="btn btn-primary mb-2" 
                      (click)="sendTestMessage('notification')">
                Send Test Notification
              </button>
              
              <button class="btn btn-warning mb-2" 
                      (click)="sendTestMessage('alert')">
                Send Test Alert
              </button>
              
              <button class="btn btn-info mb-2" 
                      (click)="sendTestMessage('status')">
                Send Status Update
              </button>
            </div>
          </div>
          
          <div class="col-md-6">
            <div class="ws-messages">
              <h4>Recent Messages</h4>
              @if (recentMessages.length > 0) {
                <ul class="list-unstyled">
                  @for (message of recentMessages; track message.timestamp) {
                    <li class="message-item">
                      <span class="message-type">{{ message.type }}</span>
                      <span class="message-payload">{{ message.payload | json }}</span>
                      <small class="message-time">
                        {{ message.timestamp | date:'medium' }}
                      </small>
                    </li>
                  }
                </ul>
              } @else {
                <p class="text-muted">No messages yet</p>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .mfe-container {
      padding: 20px;
    }

    .feature-card {
      background: var(--card-bg);
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      color: var(--text-primary);
    }

    .current-preferences {
      padding: 1rem;
      background: var(--bg-secondary);
      border-radius: 8px;
      margin-bottom: 1rem;
    }

    .current-preferences ul li {
      margin-bottom: 0.5rem;
      color: var(--text-secondary);
    }

    .current-preferences ul li strong {
      color: var(--text-primary);
      margin-right: 0.5rem;
    }

    .config-display {
      background: var(--bg-secondary);
      padding: 15px;
      border-radius: 5px;
      font-size: 0.9rem;
      color: var(--text-primary);
      max-height: 200px;
      overflow-y: auto;
    }

    .bi-check-circle-fill {
      color: var(--bs-success);
    }

    .bi-x-circle-fill {
      color: var(--bs-danger);
    }

    li {
      margin-bottom: 8px;
    }

    li i {
      margin-right: 8px;
    }

    .btn-outline-primary {
      border-color: var(--bs-primary);
      color: var(--bs-primary);
    }

    .btn-outline-primary:hover {
      background-color: var(--bs-primary);
      color: white;
    }

    .search-test-controls {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .search-history {
      background: var(--bg-secondary);
      padding: 1rem;
      border-radius: 8px;
    }

    .history-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.5rem;
      border-bottom: 1px solid var(--border-color);
    }

    .history-item:last-child {
      border-bottom: none;
    }

    .query {
      font-weight: 500;
      color: var(--text-primary);
    }

    .count {
      color: var(--text-secondary);
    }

    .time {
      margin-left: auto;
      color: var(--text-secondary);
    }

    .local-search {
      background: var(--bg-secondary);
      padding: 1rem;
      border-radius: 8px;
    }

    .ws-controls {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .ws-messages {
      background: var(--bg-secondary);
      padding: 1rem;
      border-radius: 8px;
      max-height: 300px;
      overflow-y: auto;
    }

    .message-item {
      padding: 0.5rem;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .message-type {
      font-weight: 500;
      color: var(--bs-primary);
    }

    .message-payload {
      font-family: monospace;
      font-size: 0.875rem;
      color: var(--text-secondary);
    }

    .message-time {
      color: var(--text-muted);
    }
  `]
})
export class ExampleComponent implements OnInit {
  counter = 0;
  currentConfig: AppConfig | null = null;
  showPreferences = false;
  readonly preferences$;
  readonly searchHistory$;
  recentMessages: WebSocketMessage[] = [];

  constructor(
    private loaderService: LoaderService,
    private notificationService: NotificationService,
    private configService: ConfigService,
    private breadcrumbService: BreadcrumbService,
    private preferencesService: UserPreferencesService,
    private http: HttpClient,
    private searchService: SearchService,
    private wsService: WebSocketService
  ) {
    this.preferences$ = this.preferencesService.preferences$;
    this.searchHistory$ = this.searchService.history$;
  }

  ngOnInit() {
    this.currentConfig = this.configService.getConfig();
    
    // Subscribe to config changes
    this.configService.config$.subscribe(config => {
      this.currentConfig = config;
    });

    // Subscribe to WebSocket messages
    this.wsService.messages$.subscribe(message => {
      this.recentMessages = [message, ...this.recentMessages].slice(0, 5);
    });
  }

  isFeatureEnabled(feature: keyof AppConfig['features']): boolean {
    return this.configService.isFeatureEnabled(feature);
  }

  simulateLoading() {
    this.loaderService.show('Loading MFE Data...');

    // Simulate API call
    setTimeout(() => {
      this.loaderService.hide();
      this.notificationService.success('MFE Data loaded successfully!');
    }, 2000);
  }

  simulateError(type: 'runtime' | 'http' | 'custom') {
    switch (type) {
      case 'runtime':
        // Trigger a TypeError
        const nullObject: any = null;
        nullObject.nonExistentMethod();
        break;

      case 'http':
        // Trigger an HTTP error
        this.http.get('https://non-existent-api.com/data').subscribe({
          error: (error) => console.error('HTTP Error:', error)
        });
        break;

      case 'custom':
        // Throw a custom error
        throw new Error('This is a custom error for testing');
    }
  }

  updateBreadcrumb(feature: string) {
    this.breadcrumbService.setBreadcrumbs([
      { label: 'MFE Example', url: '/mfe1', icon: 'bi-puzzle' },
      { label: feature, url: '/mfe1/' + feature.toLowerCase(), icon: 'bi-gear' }
    ]);
    
    this.notificationService.info(`Navigated to ${feature}`);
  }

  togglePreferencesPanel() {
    this.showPreferences = !this.showPreferences;
  }

  testSearch(query: string) {
    this.searchService.search(query).subscribe(results => {
      this.notificationService.info(`Found ${results.length} results for "${query}"`);
    });
  }

  clearSearchHistory() {
    this.searchService.clearHistory();
    this.notificationService.success('Search history cleared');
  }

  sendTestMessage(type: WebSocketMessage['type']) {
    const testMessages = {
      notification: { message: 'Test notification message' },
      alert: { message: 'Test alert message' },
      status: { status: 'online', timestamp: Date.now() }
    };

    this.wsService.simulateIncomingMessage(type, testMessages[type as keyof typeof testMessages]);
  }
} 