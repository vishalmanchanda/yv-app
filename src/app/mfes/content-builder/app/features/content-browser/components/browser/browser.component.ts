import { Component, importProvidersFrom, OnInit, Provider } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { ImportDialogComponent } from '../import-dialog/import-dialog.component';

import { ContentBuilderService } from '../../../../core/services/content-builder.service';

import { ContentFilters } from '../../models/filter.models';
import { Observable } from 'rxjs';


import { CommonModule } from '@angular/common';
import { ContentFilterComponent } from '../content-filter/content-filter.component';
import { ContentListComponent } from '../content-list/content-list.component';

import { RouterModule } from '@angular/router';
import { ContentMetadata } from '../../../../../../../core/models/content.models';
import { ToastService } from '../../../../core/services/toast.service';





@Component({
  standalone: true,
  imports: [ CommonModule, RouterModule, ContentFilterComponent, ContentListComponent],
  selector: 'app-browser',
  template: `
    <div class="browser-container mx-5 mb-5 mt-2">
      <div class="browser-header">
        <h1>Content Browser</h1>

        <div class="header-actions">
          <button class="btn btn-primary me-3" (click)="importContent()">
            <i class="bi bi-upload me-2"></i>
            Import
          </button>
          <button class="btn btn-primary" [routerLink]="['/content-builder/content/new']">
            <i class="bi bi-plus me-2"></i>
            Create New
          </button>
        </div>
      </div>

      <app-content-filter
        (filterChange)="onFilterChange($event)"
      ></app-content-filter>

      <!-- Debug info -->
      <div *ngIf="dbInitError" class="alert alert-danger">
        <strong>Database Error:</strong> {{ dbInitError }}
      </div>

      <app-content-list
        [contents]="contents$ | async"
        [loading]="loading$ | async"
        (contentSelected)="onContentSelected($event)"
        (contentDeleted)="onContentDeleted($event)"
        (contentExported)="onContentExported($event)"
      ></app-content-list>
    </div>
  `,
  styles: [`
    .browser-container {
      padding: 24px;
      // height: 100%;
    }

    .browser-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .header-actions {
      display: flex;
      gap: 16px;
    }

    h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 500;
    }
  `]
})
export class BrowserComponent implements OnInit {

  contents$: Observable<ContentMetadata[]>;
  loading$: Observable<boolean>;
  dbInitError: string | null = null;

  constructor(
    private modalService: NgbModal,
    private contentService: ContentBuilderService,
    private router: Router,
    private toastService: ToastService
  ) {
    this.contents$ = this.contentService.contents$;
    this.loading$ = this.contentService.loading$;
  }

  async ngOnInit() {
    try {
      console.log('BrowserComponent initializing...');
      
      // Check if IndexedDB is supported
      if (!window.indexedDB) {
        this.dbInitError = "Your browser doesn't support IndexedDB. Content Builder features will not work.";
        this.toastService.show('Error', this.dbInitError, 'bg-danger');
        return;
      }
      
      // Subscribe to error messages from the service
      this.contentService.error$.subscribe(error => {
        if (error) {
          this.dbInitError = error;
          console.error('ContentBuilderService error:', error);
          this.toastService.show('Error', error, 'bg-danger');
        }
      });
      
      console.log('Loading contents...');
      await this.contentService.loadContents();
      console.log('Contents loaded');
    } catch (error) {
      console.error('Error in BrowserComponent initialization:', error);
      this.dbInitError = error instanceof Error ? error.message : 'Unknown error';
      this.toastService.show('Error', 'Failed to initialize content browser', 'bg-danger');
    }
  }

  onFilterChange(filters: any) {
    // Implement filtering logic
    console.log('Filter changed:', filters);
  }

  onContentSelected(content: ContentMetadata) {
    console.log('Content selected:', content);
    this.router.navigate(['/content-builder/editor', content.id]);
  }

  async onContentDeleted(contentId: string) {
    console.log('onContentDeleted', contentId);
    try {
      await this.contentService.deleteContent(contentId);
      this.toastService.show('Content deleted successfully', 'Content deleted successfully', 'bg-success');
    } catch (error) {
      this.toastService.show('Error deleting content', 'Error deleting content', 'bg-danger');
    }
  }

  onContentExported(content: ContentMetadata) {
    // Implement export action
    console.log('Content exported:', content);
  }

  importContent() {
    const modalRef = this.modalService.open(ImportDialogComponent, {
      size: 'lg',
      centered: true
    });
    modalRef.result.then((result) => {
      this.toastService.show('Content imported successfully', 'Content imported successfully', 'bg-success');
    }, (reason) => {
      console.log('Import dialog dismissed:', reason);
    });
  }

  createNewContent() {
    this.router.navigate(['/content-builder/content/new']);
  }

  private filterContents(contents: ContentMetadata[], filters: ContentFilters): ContentMetadata[] {
    let filtered = [...contents];

    // Apply search filter
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(content => 
        content.title.toLowerCase().includes(searchTerm)
      );
    }

    // Apply date filter
    if (filters.dateRange?.start || filters.dateRange?.end) {
      filtered = filtered.filter(content => {
        const contentDate = new Date(content.updatedAt);
        const start = filters.dateRange?.start ? new Date(filters.dateRange.start) : null;
        const end = filters.dateRange?.end ? new Date(filters.dateRange.end) : null;

        if (start && end) {
          return contentDate >= start && contentDate <= end;
        } else if (start) {
          return contentDate >= start;
        } else if (end) {
          return contentDate <= end;
        }
        return true;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const direction = filters.sortDirection === 'asc' ? 1 : -1;
      
      switch (filters.sortBy) {
        case 'title':
          return direction * a.title.localeCompare(b.title);
        case 'updatedAt':
          return direction * (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
        case 'createdAt':
          return direction * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        default:
          return 0;
      }
    });

    return filtered;
  }
} 