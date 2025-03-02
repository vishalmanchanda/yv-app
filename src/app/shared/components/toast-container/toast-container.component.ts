import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NotificationService, Notification } from '../../../core/services/notification.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toasts; track toast.id) {
        <div 
          class="toast show" 
          [class]="'toast-' + toast.type"
          (click)="removeToast(toast.id)">
          <div class="toast-header">
            <i class="bi" [class]="getIconClass(toast.type)"></i>
            <strong class="me-auto">{{ toast.title || getDefaultTitle(toast.type) }}</strong>
            <button type="button" class="btn-close" (click)="removeToast(toast.id)"></button>
          </div>
          <div class="toast-body">
            {{ toast.message }}
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1050;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .toast {
      min-width: 300px;
      max-width: 400px;
      background: var(--card-bg);
      color: var(--text-primary);
      border: none;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      cursor: pointer;
      transition: transform 0.2s, opacity 0.2s;
    }

    .toast:hover {
      transform: translateY(-2px);
    }

    .toast-header {
      background: transparent;
      border-bottom: 1px solid var(--border-color);
      color: var(--text-primary);
    }

    .toast-success {
      border-left: 4px solid #198754;
    }

    .toast-error {
      border-left: 4px solid #dc3545;
    }

    .toast-warning {
      border-left: 4px solid #ffc107;
    }

    .toast-info {
      border-left: 4px solid #0dcaf0;
    }

    .bi {
      margin-right: 8px;
    }

    .btn-close {
      filter: invert(1) grayscale(100%) brightness(200%);
    }
  `]
})
export class ToastContainerComponent implements OnInit, OnDestroy {
  toasts: Notification[] = [];
  private subscription = new Subscription();

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.subscription.add(
      this.notificationService.notifications$.subscribe(toast => {
        this.toasts = [...this.toasts, toast];
      })
    );

    this.subscription.add(
      this.notificationService.removeNotification$.subscribe(id => {
        this.toasts = this.toasts.filter(t => t.id !== id);
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  removeToast(id: string) {
    this.notificationService.remove(id);
  }

  getIconClass(type: string): string {
    switch (type) {
      case 'success': return 'bi-check-circle-fill';
      case 'error': return 'bi-x-circle-fill';
      case 'warning': return 'bi-exclamation-triangle-fill';
      case 'info': return 'bi-info-circle-fill';
      default: return 'bi-bell-fill';
    }
  }

  getDefaultTitle(type: string): string {
    switch (type) {
      case 'success': return 'Success';
      case 'error': return 'Error';
      case 'warning': return 'Warning';
      case 'info': return 'Information';
      default: return 'Notification';
    }
  }
} 