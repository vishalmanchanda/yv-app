import { Component, Input, Output, EventEmitter, Provider } from '@angular/core';

import { ContentCardComponent } from '../content-card/content-card.component';
import { CommonModule } from '@angular/common';
import { ContentBuilderService } from '../../../../core/services/content-builder.service';
import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from '../../../../core/services/toast.service';
import { Router } from '@angular/router';
import { ContentMetadata } from '../../../../../../../core/models/content.models';





@Component({
  selector: 'app-content-list',
  standalone: true,
  imports: [CommonModule, ContentCardComponent, NgbDropdownModule],


  template: `
    <div class="content-list">
      <!-- View Toggle -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h6 class="mb-0 text-body-secondary">
          {{ contents?.length || 0 }} Content Items
        </h6>
        <div class="btn-group shadow-sm">
          <button class="btn" 
                  [class.btn-light]="viewMode !== 'grid'"
                  [class.btn-primary]="viewMode === 'grid'"
                  (click)="setViewMode('grid')">
            <i class="bi bi-grid"></i>
          </button>
          <button class="btn" 
                  [class.btn-light]="viewMode !== 'list'"
                  [class.btn-primary]="viewMode === 'list'"
                  (click)="setViewMode('list')">
            <i class="bi bi-list"></i>
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <!-- Grid View -->
      <div *ngIf="!loading && viewMode === 'grid'" class="row g-4">
        <div *ngFor="let content of contents" 
             class="col-12 col-md-6 col-lg-4 col-xl-3">
          <app-content-card
            [content]="content"
            (openContent)="onOpenContent(content)"
            (previewContent)="onPreviewContent(content.id)">              
          </app-content-card>          
        </div>
      </div>

      <!-- List View -->
      <div *ngIf="!loading && viewMode === 'list'" class="card border-0 shadow-sm">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead>
              <tr>
                <th class="ps-4">Title</th>
                <th>Type</th>
                <th>Status</th>
                <th>Last Updated</th>
                <th class="text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let content of contents">
                <td class="ps-4">
                  <div class="d-flex align-items-center">
                    <i class="bi me-2" [class]="getTypeIcon(content.type)"></i>
                    <span class="text-truncate" style="max-width: 300px;">
                      {{ content.title }}
                    </span>
                  </div>
                </td>
                <td>{{ content.type | titlecase }}</td>
                <td>
                  <span class="badge rounded-pill" [ngClass]="getStatusClass(content.status)">
                    {{ content.status }}
                  </span>
                </td>
                <td>{{ content.updatedAt | date:'MMM d, y' }}</td>
                <td class="text-end pe-4">
                  <div class="btn-group">
                    <button class="btn btn-sm btn-primary rounded-pill px-3" 
                            (click)="onOpenContent(content)">
                      Edit
                    </button>
                    <button class="btn btn-sm btn-primary rounded-pill px-3" 
                            (click)="onPreviewContent(content.id)">
                      Preview
                    </button>
                    <button class="btn btn-sm btn-light rounded-circle ms-2" 
                            type="button" 
                            (click)="onExportContent(content)">
                      <i class="bi bi-download"></i> Export
                    </button>
                    <button class="btn btn-sm btn-light rounded-circle ms-2" 
                            type="button" 
                            (click)="onDeleteContent(content.id)">
                      <i class="bi bi-trash"></i> Delete
                    </button>                    
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && contents?.length === 0" 
           class="text-center py-5 rounded-3">
        <div class="py-4">
          <i class="bi bi-inbox display-1 text-muted mb-3"></i>
          <h5 class="fw-semibold">No Content Found</h5>
          <p class="text-muted mb-0">Try adjusting your search or filter criteria</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .table {
      th {
        background-color: var(--bs-light);
        font-weight: 600;
        font-size: 0.875rem;
        white-space: nowrap;
        border-bottom-width: 1px;
        color: var(--bs-gray-600);
      }
      
      td {
        vertical-align: middle;
        font-size: 0.875rem;
      }
    }

    .badge {
      font-weight: 500;
      
      &.badge-draft {
        background-color: var(--bs-gray-500);
      }
      &.badge-published {
        background-color: var(--bs-success);
      }
      &.badge-archived {
        background-color: var(--bs-secondary);
      }
    }

    .btn-group {
      .btn {
        border: 1px solid var(--bs-gray-200);
        
        &:hover {
          z-index: 1;
        }
      }
    }
  `]
})
export class ContentListComponent {
  @Input() contents: ContentMetadata[] | null = null;
  @Input() loading: boolean | null = false;
  @Output() contentSelected = new EventEmitter<ContentMetadata>();
  @Output() contentDeleted = new EventEmitter<string>();
  @Output() contentExported = new EventEmitter<ContentMetadata>();
  @Output() contentUpdated = new EventEmitter<ContentMetadata>();
  @Output() openContent = new EventEmitter<ContentMetadata>();
  @Output() previewContent = new EventEmitter<string>();
 
  viewMode: 'grid' | 'list' = 'list';

  constructor(private contentService: ContentBuilderService, 
              private toastService: ToastService,
              private modalService: NgbModal,
              private router: Router  ) {}

  setViewMode(mode: 'grid' | 'list') {
    this.viewMode = mode;
  }

  getTypeIcon(type: string) {
    if (!type) return 'bi bi-file';
    return `bi bi-${type.toLowerCase()}`;
  }

  getStatusClass(status: string) {
    if (!status) return 'badge-draft';
    return `badge-${status.toLowerCase()}`;
  }


  onOpenContent(content: ContentMetadata) {
    this.contentSelected.emit(content);
  }

  onExportContent(content: ContentMetadata) {
    try {
      this.contentExported.emit(content);
      
      // Create and download the file
      this.downloadContent(content).then(blob => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${content.title.toLowerCase().replace(/\s+/g, '-')}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        // Show success message
        this.toastService.show('Content exported', 'Your content has been exported successfully.', 'bg-success');
      }).catch(error => {
        console.error('Error exporting content:', error);
        this.toastService.show('Export failed', 'There was an error exporting your content.', 'bg-danger');
      });
      
    } catch (error) {
      console.error('Error exporting content:', error);
    }
  }

  onDeleteContent(contentId: string) {
    if (confirm('Are you sure you want to delete this content?')) {
      this.contentDeleted.emit(contentId);
    }
  }

  async downloadContent(content: ContentMetadata): Promise<Blob> {
    return await this.contentService.exportContent(content.id);
  }

  onPreviewContent(contentId: string) {
    window.open(`/content-builder/preview/${contentId}`, '_blank');
  }

} 
