import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ToastService } from '../../services/toast.service';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule],

  selector: 'app-toast',
  template: `
    <div class="toast-container position-fixed bottom-0 end-0 p-3">
      <div 
        *ngFor="let toast of toasts"
        class="toast show" 
        [class]="toast.className" 
        role="alert" 
        aria-live="assertive" 
        aria-atomic="true">
        <div class="toast-header">
          <strong class="me-auto">{{ toast.header }}</strong>
          <button type="button" class="btn-close" (click)="removeToast(toast)"></button>
        </div>
        <div class="toast-body">
          {{ toast.body }}
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: any[] = [];
  toastSubscription: Subscription = new Subscription;

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.toastSubscription = this.toastService.toastEvents.subscribe(
      (toast) => {
        this.toasts.push(toast);
        setTimeout(() => this.removeToast(toast), 5000);
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
