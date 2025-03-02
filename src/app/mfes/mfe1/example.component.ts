import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderService } from '../../core/services/loader.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'mfe1-example',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mfe-container">
      <h2>Embedded MFE 1</h2>
      <div class="feature-card">
        <h3>Feature Overview</h3>
        <p>This is an embedded microfrontend that can be extracted later.</p>
        
        <div class="demo-controls">
          <button (click)="simulateLoading()" class="btn btn-primary me-2">
            Simulate Loading
          </button>
          <button (click)="counter = counter + 1" class="btn btn-secondary">
            Count: {{ counter }}
          </button>
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

    h2, h3 {
      color: var(--text-primary);
    }

    p {
      color: var(--text-secondary);
    }

    .demo-controls {
      margin-top: 20px;
    }

    .btn-primary {
      background-color: var(--bs-primary);
      border-color: var(--bs-primary);
    }

    .btn-primary:hover {
      opacity: 0.9;
    }
  `]
})
export class ExampleComponent {
  counter = 0;

  constructor(
    private loaderService: LoaderService,
    private notificationService: NotificationService
  ) {}

  simulateLoading() {
    this.loaderService.show('Loading MFE Data...');

    // Simulate API call
    setTimeout(() => {
      this.loaderService.hide();
      this.notificationService.success('MFE Data loaded successfully!');
    }, 2000);
  }
} 