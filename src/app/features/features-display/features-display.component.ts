import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { marked } from 'marked';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-features-display',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid mt-4 px-4">
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h2 class="mb-0">Application Features</h2>
              <button class="btn btn-sm btn-outline-primary" (click)="refreshContent()">
                <i class="bi bi-arrow-clockwise"></i> Refresh
              </button>
            </div>
            <div class="card-body px-4">
              <div class="markdown-content" [innerHTML]="htmlContent"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .markdown-content {
      line-height: 1.6;
    }
    
    .markdown-content h1 {
      font-size: 2rem;
      margin-bottom: 1.5rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid var(--bs-border-color);
    }
    
    .markdown-content h2 {
      font-size: 1.75rem;
      margin-top: 2rem;
      margin-bottom: 1rem;
      padding-bottom: 0.3rem;
      border-bottom: 1px solid var(--bs-border-color-translucent);
    }
    
    .markdown-content h3 {
      font-size: 1.5rem;
      margin-top: 1.5rem;
      margin-bottom: 0.75rem;
    }
    
    .markdown-content ul, .markdown-content ol {
      padding-left: 2rem;
      margin-bottom: 1rem;
    }
    
    .markdown-content li {
      margin-bottom: 0.5rem;
    }
    
    .markdown-content code {
      background-color: var(--bs-gray-200);
      padding: 0.2rem 0.4rem;
      border-radius: 0.25rem;
      font-family: SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      font-size: 0.875em;
    }
    
    .markdown-content pre {
      background-color: var(--bs-gray-100);
      padding: 1rem;
      border-radius: 0.375rem;
      overflow-x: auto;
      margin-bottom: 1rem;
    }
    
    .markdown-content pre code {
      background-color: transparent;
      padding: 0;
      font-size: 0.875em;
      color: inherit;
    }
    
    .markdown-content blockquote {
      border-left: 4px solid var(--bs-primary);
      padding-left: 1rem;
      margin-left: 0;
      color: var(--bs-gray-600);
    }
    
    .markdown-content table {
      width: 100%;
      margin-bottom: 1rem;
      border-collapse: collapse;
    }
    
    .markdown-content table th,
    .markdown-content table td {
      padding: 0.5rem;
      border: 1px solid var(--bs-border-color);
    }
    
    .markdown-content table th {
      background-color: var(--bs-gray-100);
    }
    
    /* Dark mode adjustments */
    @media (prefers-color-scheme: dark) {
      .markdown-content code {
        background-color: var(--bs-gray-800);
      }
      
      .markdown-content pre {
        background-color: var(--bs-gray-900);
      }
      
      .markdown-content blockquote {
        color: var(--bs-gray-400);
      }
      
      .markdown-content table th {
        background-color: var(--bs-gray-800);
      }
    }
  `]
})
export class FeaturesDisplayComponent implements OnInit {
  htmlContent: string = '';

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadMarkdownContent();
  }

  loadMarkdownContent(): void {
    this.http.get('assets/features.md', { responseType: 'text' })
      .subscribe({
        next: (content) => {
          try {
            // Use marked in a safer way
            const html = marked.parse(content, { async: false });
            this.htmlContent = html as string;
          } catch (err) {
            console.error('Error parsing markdown:', err);
            this.notificationService.error('Failed to parse markdown content');
            this.htmlContent = '<div class="alert alert-danger">Failed to parse content. Please try again later.</div>';
          }
        },
        error: (error) => {
          console.error('Error loading markdown content:', error);
          this.notificationService.error('Failed to load features documentation');
          this.htmlContent = '<div class="alert alert-danger">Failed to load content. Please try again later.</div>';
        }
      });
  }

  refreshContent(): void {
    this.loadMarkdownContent();
    this.notificationService.info('Content refreshed');
  }
} 