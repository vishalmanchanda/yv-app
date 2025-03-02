import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderService } from '../../../core/services/loader.service';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (loading$ | async; as state) {
      @if (state.show) {
        <div class="loading-overlay">
          <div class="spinner-container">
            <div class="spinner"></div>
            <div class="loading-text">{{ state.message }}</div>
          </div>
        </div>
      }
    }
  `,
  styles: [`
    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(var(--bg-primary-rgb), 0.7);
      backdrop-filter: blur(2px);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    }

    .spinner-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .spinner {
      width: 50px;
      height: 50px;
      border: 3px solid var(--border-color);
      border-top: 3px solid var(--bs-primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .loading-text {
      color: var(--text-primary);
      font-size: 1.1rem;
      font-weight: 500;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class LoadingSpinnerComponent {
  readonly loading$;

  constructor(loaderService: LoaderService) {
    this.loading$ = loaderService.loading$;
  }
} 