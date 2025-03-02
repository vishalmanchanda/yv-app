import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="copyright">
            &copy; {{ currentYear }} {{ appName }}. All rights reserved.
          </div>
          <div class="version">
            Version {{ appVersion }}
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background-color: var(--bs-body-bg);
      border-top: 1px solid var(--bs-border-color);
      padding: 1rem 0;
      margin-top: 2rem;
    }
    
    .footer-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.875rem;
      color: var(--bs-secondary-color);
    }
    
    .version {
      font-size: 0.75rem;
    }
  `]
})
export class FooterComponent {
  @Input() appName: string = 'Application';
  @Input() appVersion: string = '1.0.0';
  
  get currentYear(): number {
    return new Date().getFullYear();
  }
} 