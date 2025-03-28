import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ContentMetadata } from '../../../../../../../core/models/content.models';
import { CommonModule } from '@angular/common';
import { TruncatePipe } from "../../../../core/utils/string-utils";

@Component({
  selector: 'app-content-card',
  standalone: true,
  imports: [CommonModule, TruncatePipe],
  template: `
    <div class="content-card card h-100 border-1">
      <!-- Cover Image -->
      <div class="card-img-top position-relative">
        <img [src]="content.coverImage" 
             class="w-100 object-fit-cover rounded-top" 
             style="height: 190px;"
             [alt]="">
        <span class="status-badge badge position-absolute "
              [ngClass]="getStatusClass(content.status)" *ngIf="content.status">
          {{ content.status }}
        </span>
      </div>

      <div class="card-body d-flex flex-column">
        <!-- Title -->
        <h6 class="card-title lead mb-2 text-truncate fw-semibold">
          {{ content.title }}
        </h6>

        <!-- Description -->
        <p class="card-text text-muted small mb-3 flex-grow-1">
          {{ (content.description | truncate:100) || 'No description available' }}
        </p>

        <!-- Metadata -->
        <div class="card-metadata d-flex justify-content-between align-items-center">
          <div class="metadata-left">
            <div class="text-muted small mb-1">
              <i class="bi" [class]="getTypeIcon(content.type)"></i>
              <span class="ms-1">{{ content.type | titlecase }}</span>
            </div>
            <div class="text-muted small">
              <i class="bi bi-clock"></i>
              <span class="ms-1">{{ content.updatedAt | date:'MMM d, y' }}</span>
            </div>
          </div>
          
          <button class="btn btn-sm btn-primary px-3 rounded-pill" 
                  (click)="openContent.emit(content)">
            Edit
          </button>
          <button class="btn btn-sm btn-primary px-3 rounded-pill" 
                  (click)="onPreviewContent(content.id)">
            Preview
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .content-card {
      transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 .5rem 1rem rgba(0,0,0,.08);
      }
    }

    .status-badge {
      top: 12px;
      right: 12px;
      font-size: 0.75rem;
      padding: 0.35em 0.65em;
      text-transform: capitalize;
      
      &.badge-draft {
        background-color: var(--bs-gray-600);
      }
      &.badge-published {
        background-color: var(--bs-success);
      }
      &.badge-archived {
        background-color: var(--bs-secondary);
      }
    }

    .card-metadata {
      padding-top: 0.75rem;
      border-top: 1px solid var(--bs-gray-200);
    }

    .metadata-left {
      line-height: 1.2;
    }
  `]
})
export class ContentCardComponent {
  @Input() content!: ContentMetadata;
  @Output() deleted = new EventEmitter<void>();
  @Output() exported = new EventEmitter<void>();
  @Output() openContent = new EventEmitter<ContentMetadata>();
  getTotalSections(): number {
    return this.content.partsMetadata.reduce(
      (total, part) => total + part.sectionCount, 
      0
    );
  }

  onExport() {
    this.exported.emit();
  }

  onDelete() {
    this.deleted.emit();
  }

  

  getTypeIcon(type: string) {
    if (!type) return 'bi bi-book';
    return `bi bi-${type.toLowerCase()}`;
  }

  getStatusClass(status: string) {
    if (!status) return 'badge-draft';
    return `badge-${status.toLowerCase()}`;
  }

  onPreviewContent(contentId: string) {
    window.open(`content-builder/preview/${contentId}`, '_blank');
  }
} 
