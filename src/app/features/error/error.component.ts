import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-error',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="error-container">
      <div class="error-content">
        <i class="bi bi-exclamation-triangle display-1 text-warning"></i>
        <h1>{{ title }}</h1>
        <p>{{ message }}</p>
        <button class="btn btn-primary" routerLink="/">
          Return to Home
        </button>
      </div>
    </div>
  `,
  styles: [`
    .error-container {
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--bg-primary);
      color: var(--text-primary);
    }

    .error-content {
      text-align: center;
      padding: 2rem;
    }

    h1 {
      margin: 1rem 0;
      color: var(--text-primary);
    }

    p {
      color: var(--text-secondary);
      margin-bottom: 2rem;
    }
  `]
})
export class ErrorComponent implements OnInit {
  title = 'Error';
  message = 'An unexpected error occurred.';

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['code'] === '404') {
        this.title = 'Page Not Found';
        this.message = 'The page you are looking for does not exist.';
      } else {
        this.message = params['message'] || this.message;
      }
    });
  }
} 