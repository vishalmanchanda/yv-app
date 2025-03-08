import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BreadcrumbService, Breadcrumb } from '../../../core/services/breadcrumb.service';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="breadcrumb-nav" aria-label="breadcrumb">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <a routerLink="/">
            <i class="bi bi-house-door"></i>
          </a>
        </li>
        @for (breadcrumb of breadcrumbs$ | async; track breadcrumb.url) {
          <li class="breadcrumb-item">
            <a [routerLink]="breadcrumb.url" (click)="onBreadcrumbClick(breadcrumb)">
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
      position: sticky;
      top: 56px; /* Height of the navbar */
      z-index: 1020; /* Just below navbar's z-index */
      padding: 0.75rem 1.5rem;
      background: var(--bs-body-bg);
      border-bottom: 1px solid var(--bs-border-color);
      margin-bottom: 0;
      transition: background-color 0.3s ease, border-color 0.3s ease;
    }

    .breadcrumb {
      margin: 0;
      padding: 0;
      background: transparent;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem;
    }

    .breadcrumb-item {
      display: flex;
      align-items: center;
      color: var(--bs-secondary-color);
      font-size: 0.875rem;
    }

    .breadcrumb-item a {
      color: var(--bs-secondary-color);
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      transition: all 0.2s ease-in-out;
    }

    .breadcrumb-item a:hover {
      color: var(--bs-primary);
      background: var(--bs-secondary-bg);
    }

    .breadcrumb-item.active {
      color: var(--bs-emphasis-color);
    }

    .breadcrumb-item + .breadcrumb-item::before {
      color: var(--bs-secondary-color);
      content: "/";
      padding: 0 0.5rem;
    }

    .bi {
      font-size: 1rem;
      line-height: 1;
    }

    @media (max-width: 768px) {
      .breadcrumb-nav {
        padding: 0.5rem 1rem;
      }
      
      .breadcrumb-item {
        font-size: 0.8125rem;
      }
    }
  `]
})
export class BreadcrumbComponent {
  readonly breadcrumbs$;

  constructor(private breadcrumbService: BreadcrumbService) {
    this.breadcrumbs$ = this.breadcrumbService.breadcrumbs$;
  }

  onBreadcrumbClick(clickedBreadcrumb: Breadcrumb) {
    // Get current breadcrumbs
    this.breadcrumbs$.subscribe(breadcrumbs => {
      // Find the index of the clicked breadcrumb
      const index = breadcrumbs.findIndex(b => b.url === clickedBreadcrumb.url);
      
      if (index !== -1) {
        // Keep only the breadcrumbs up to and including the clicked one
        const updatedBreadcrumbs = breadcrumbs.slice(0, index + 1);
        // Update the breadcrumb service with the new array
        this.breadcrumbService.setBreadcrumbs(updatedBreadcrumbs);
      }
    }).unsubscribe(); // Unsubscribe immediately since we only need this once
  }
} 