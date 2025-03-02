import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebSocketService, WebSocketStatus } from '../../../core/services/websocket.service';

@Component({
  selector: 'app-websocket-status',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (status$ | async; as status) {
      <div class="ws-status" [class.connected]="status.connected">
        <i class="bi" [class.bi-wifi]="status.connected" 
           [class.bi-wifi-off]="!status.connected"></i>
        <span class="status-text">
          {{ status.connected ? 'Connected' : 'Disconnected' }}
        </span>
        @if (status.lastConnected && !status.connected) {
          <span class="reconnect-text">
            Reconnecting... ({{ status.reconnectAttempt }})
          </span>
        }
      </div>
    }
  `,
  styles: [`
    .ws-status {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem;
      border-radius: 4px;
      background: var(--bg-secondary);
      color: var(--text-danger);
      font-size: 0.875rem;
    }

    .ws-status.connected {
      color: var(--text-success);
    }

    .status-text {
      font-weight: 500;
    }

    .reconnect-text {
      font-size: 0.75rem;
      color: var(--text-warning);
    }

    .bi {
      font-size: 1.1rem;
    }
  `]
})
export class WebSocketStatusComponent {
  readonly status$;

  constructor(private wsService: WebSocketService) {
    this.status$ = this.wsService.status$;
  }
} 