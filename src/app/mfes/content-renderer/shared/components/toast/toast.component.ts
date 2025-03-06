import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ToastService } from '../../../core/services/toast.service';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule],

  selector: 'cr-toast',
  template: `
    <div class="toast-container position-fixed bottom-0 align-items-center p-3 mb-5">
      <div 
        *ngFor="let toast of toasts"
        class="toast show" 
        role="alert" 
        aria-live="assertive" 
        aria-atomic="true">
        <!-- <div class="toast-header">
          <strong class="me-auto">{{ toast.header }}</strong>
          <button type="button" class="btn-close" (click)="removeToast(toast)" aria-label="Close"></button>
        </div> -->
        <div class="toast-body text-center">
          {{ toast.body }}
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .toast-container {
        margin-bottom: 5rem;
      }

      .toast {
        background-color: var(--bs-body-color);
      }

      .toast-body {
        color: var(--bs-body-bg);
        // font-size: 1.1rem;
      }
    `
  ]
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: any[] = [];
  toastSubscription: Subscription = new Subscription;

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.toastSubscription = this.toastService.toastEvents.subscribe(
      (toast) => {
        this.toasts.push(toast);
        setTimeout(() => this.removeToast(toast), 2000);
      }
    );
  }

  removeToast(toast: any) {
    const index = this.toasts.indexOf(toast);
    if (index > -1) {
      this.toasts.splice(index, 1);
    }
  }

  ngOnDestroy() {
    this.toastSubscription.unsubscribe();
  }
}
