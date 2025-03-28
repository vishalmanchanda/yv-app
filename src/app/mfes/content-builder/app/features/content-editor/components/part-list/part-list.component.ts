import { Component, Input, Output, EventEmitter } from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ContentMetadata } from '../../../../../../../core/models/content.models';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    DatePipe
  ],
  selector: 'app-part-list',
  template: `
    <div class="part-list-container">
      <!-- Content Header -->
      <div class="content-header" (click)="contentHeaderClick.emit()"
           role="button"
           tabindex="0"
           (keyup.enter)="contentHeaderClick.emit()">
        <div class="d-flex align-items-center gap-3">
          <img *ngIf="content?.coverImage" [src]="content?.coverImage" 
               class="cover-image rounded image-fluid height-auto" style="max-height: 90px;" alt="Cover image">
          <div class="content-info">
            <h4 class="title">{{ content?.title }}</h4>
            <div class="metadata" *ngIf="content?.authors && content?.authors!.length > 0">
              <p class="authors">{{ authors }} </p>
              <p class="date">Created: {{ content?.createdAt | date:'MMM d, y, h:mm a' }}</p>
            </div>
            <!-- TODO: Add a button to preview the content in the renderer in new tab -->
            <button class="btn btn-sm btn-outline-primary mt-2" (click)="previewContent()">
              <i class="bi bi-eye"></i> Preview
            </button>
          </div>
        </div>
      </div>

      <!-- Parts Header -->
      <div class="parts-header">
        <h5>Parts</h5>
      </div>

      <!-- Scrollable Parts List -->
      <div class="parts-list flex-grow-1 overflow-auto p-3">
        <div class="list-group">
          <a href="#" 
             class="list-group-item"
             *ngFor="let part of content?.partsMetadata; let i = index"
             (click)="partSelected.emit(part.id); $event.preventDefault()"
             [class.active]="selectedPartId === part.id">
            <div class="d-flex align-items-center gap-2">
              <i class="bi bi-file-text"></i>
              <span class="part-number">{{ i + 1 }}.</span>              
              <span class="part-title">{{ part.title }}</span>
            </div>
          </a>
        </div>
      </div>

      <!-- Fixed Bottom Bar -->
      <div class="bottom-bar border-top p-3">
        <button class="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2"
                (click)="addPart()"
                [disabled]="!content">
          <i class="bi bi-plus-lg"></i>
          Add New Part
        </button>
      </div>
    </div>
  `,
  styles: [`
    .part-list-container {
      display: flex;
      flex-direction: column;
      height: 90vh;

    }

    .content-header {
      flex-shrink: 0;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid rgba(0,0,0,.125);
      cursor: pointer;
      transition: background-color 0.2s;


      &:hover {
        background-color: rgba(0,0,0,.03);
      }

      .title {
        font-size: 1.25rem;
        font-weight: 600;
        margin-bottom: 0.5rem;

      }

      .metadata {
        .authors {
          font-size: 0.875rem;
          color: #6c757d;
          margin-bottom: 0.05rem;
        }

        .date {
          font-size: 0.75rem;
          color: #8c98a4;
          margin-bottom: 0;
        }
      }
    }

    .parts-header {
      flex-shrink: 0;
      padding: 0.875rem 1.5rem;
      border-bottom: 1px solid rgba(0,0,0,.125);
       
      


      h5 {
        font-size: 0.875rem;
        font-weight: 600;
        margin: 0;
        color: var(--bs-body-color);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
    }

    .parts-list {
      flex: 1;
      overflow-y: auto;
      min-height: 0; // Important for Firefox


      .list-group {
        .list-group-item {
          border: none;
          padding: 0.75rem 1.5rem;
          color: var(--bs-body-color);
          border-bottom: 1px solid var(--bs-border-color);
          text-decoration: none;
          transition: all 0.2s;
          margin-bottom: 2px;

          &:hover {
            background-color: rgba(13, 110, 253, 0.04);
            color: var(--bs-primary);
          }

          &.active {
            background-color: rgba(13, 110, 253, 0.1);
            color: #0d6efd;
            border-left: 3px solid #0d6efd;

            .bi {
              color: #0d6efd;
            }
          }

          .part-number {
            font-weight: 500;
            min-width: 24px;
          }

          .part-title {
            font-weight: 400;
          }

          .bi {
            color: #6c757d;
            font-size: 1rem;
          }
        }
      }
    }

    .bottom-bar {
      flex-shrink: 0;
      padding: 1rem;
      border-top: 1px solid rgba(0,0,0,.125);
      // background-color: #fff;
      box-shadow: 0 -2px 10px rgba(0,0,0,.05);

      .btn {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0.625rem;
        font-weight: 500;
        
        .bi {
          font-size: 1.1rem;
        }
      }
    }

    // Custom Scrollbar Styles
    .custom-scrollbar {
      &::-webkit-scrollbar {
        width: 8px;
      }

      &::-webkit-scrollbar-track {
        // background: #f1f1f1;
        border-radius: 4px;
      }

      &::-webkit-scrollbar-thumb {
        background: #ccc;
        border-radius: 4px;
        
        &:hover {
          background: #bbb;
        }
      }

      // Firefox scrollbar
      scrollbar-width: thin;
      // scrollbar-color: #ccc #f1f1f1;
    }
  `]
})
export class PartListComponent {
  @Input() content: ContentMetadata | null = null;
  @Input() selectedPartId: number | null = null;
  @Output() partSelected = new EventEmitter<number>();
  @Output() contentHeaderClick = new EventEmitter<void>();
  @Output() addPartClicked = new EventEmitter<void>();

  get authors() {
    if (this.content?.authors && this.content?.authors.length > 0) {
      return this.content?.authors?.map(a => a.name).join(', ');
    }
    return '';
  }

  addPart() {
    this.addPartClicked.emit();
  }

  previewContent() {
    if (this.content) {
      const contentId = this.content.id;
      const url = `content-builder/preview/${contentId}`;
      window.open(url, '_blank');
    }
  }
  
}
