import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BreadcrumbService, Breadcrumb } from '../../../core/services/breadcrumb.service';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="breadcrumb-nav px-5" aria-label="breadcrumb">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <a routerLink="/">
            <i class="bi bi-house-door"></i>
          </a>
        </li>
        @for (breadcrumb of breadcrumbs$ | async; track breadcrumb.url) {
          <li class="breadcrumb-item">
            <a [routerLink]="breadcrumb.url">
              @if (breadcrumb.icon) {
                <i [class]="'bi ' + breadcrumb.icon"></i>
              }
              {{ breadcrumb.label }}
            </a>
          </li>
        }
      </ol>
    </nav>
  `,
  styles: [`
    .breadcrumb-nav {
      padding: 0.75rem 1rem;
      background: var(--card-bg);
      border-radius: 0.25rem;
      margin-bottom: 1rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }

    .breadcrumb {
      margin: 0;
      padding: 0;
      background: transparent;
    }

    .breadcrumb-item {
      display: flex;
      align-items: center;
      color: var(--text-secondary);
    }

    .breadcrumb-item a {
      color: var(--text-primary);
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .breadcrumb-item a:hover {
      color: var(--bs-primary);
    }

    .breadcrumb-item + .breadcrumb-item::before {
      color: var(--text-secondary);
    }

    .bi {
      font-size: 1.1rem;
    }
  `]
})
export class BreadcrumbComponent {
  readonly breadcrumbs$;

  constructor(private breadcrumbService: BreadcrumbService) {
    this.breadcrumbs$ = this.breadcrumbService.breadcrumbs$;
  }
} 