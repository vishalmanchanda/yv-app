import { Component, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { CommonModule } from '@angular/common';
import { ContentBuilderService } from '../../../../core/services/content-builder.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastService } from '../../../../core/services/toast.service';


@Component({
  selector: 'app-import-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">Import Content</h5>
      <button type="button" 
              class="btn-close" 
              aria-label="Close" 
              (click)="activeModal.dismiss()"></button>
    </div>
    
    <div class="modal-body">
      <div class="upload-area" 
           [class.drag-over]="isDragging"
           (dragover)="onDragOver($event)"
           (dragleave)="isDragging = false"
           (drop)="onDrop($event)">
        
        <input #fileInput
               type="file"
               accept=".zip"
               class="d-none"
               (change)="onFileSelected($event)">
        
        <div class="upload-content" *ngIf="!selectedFile">
          <i class="bi bi-cloud-upload display-4 text-muted"></i>
          <p class="text-muted mb-3">Drag and drop a ZIP file here or</p>
          <button class="btn btn-primary" (click)="fileInput.click()">
            Choose File
          </button>
        </div>

        <div class="file-info" *ngIf="selectedFile">
          <i class="bi bi-file-earmark-zip text-primary"></i>
          <p class="mb-0">{{ selectedFile.name }}</p>
          <button class="btn btn-sm btn-link text-danger" (click)="clearSelection()">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
      </div>

      <div class="alert alert-danger mt-3" *ngIf="error">
        {{ error }}
      </div>
    </div>

    <div class="modal-footer">
      <button class="btn btn-secondary" (click)="activeModal.dismiss()">Cancel</button>
      <button class="btn btn-primary d-flex align-items-center gap-2"
              [disabled]="!selectedFile || isImporting"
              (click)="importContent()">
        <div class="spinner-border spinner-border-sm" *ngIf="isImporting"></div>
        <span>Import</span>
      </button>
    </div>
  `,
  styles: [`
    .upload-area {
      border: 2px dashed var(--bs-gray-300);
      border-radius: 0.375rem;
      padding: 2rem;
      text-align: center;
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .upload-area.drag-over {
      border-color: var(--bs-primary);
      background: var(--bs-gray-100);
    }

    .upload-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .file-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .modal-footer .btn {
      min-width: 100px;
    }
  `]
})
export class ImportDialogComponent implements OnInit, OnDestroy {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  
  selectedFile: File | null = null;
  isDragging = false;
  isImporting = false;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    public activeModal: NgbActiveModal,
    private contentService: ContentBuilderService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    // Subscribe to import success/failure
    this.contentService.error$
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => {
        this.error = error;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files?.length) {
      this.validateAndSetFile(files[0]);
    }
  }

  onFileSelected(event: Event) {
    const files = (event.target as HTMLInputElement).files;
    if (files?.length) {
      this.validateAndSetFile(files[0]);
    }
  }

  validateAndSetFile(file: File) {
    if (file.type !== 'application/zip') {
      this.error = 'Please select a valid ZIP file';
      return;
    }
    
    this.selectedFile = file;
    this.error = null;
  }

  clearSelection() {
    this.selectedFile = null;
    this.error = null;
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  async importContent() {
    if (!this.selectedFile) return;

    try {
      this.isImporting = true;
      this.error = null;
      
      await this.contentService.importContent(this.selectedFile);
      // Show success toast using Bootstrap toast
      this.toastService.show('Content imported successfully', 'Content imported successfully', 'bg-success');
      
      this.activeModal.close(true);
    } catch (err) {
      this.error = 'Failed to import content. Please ensure the ZIP file is valid.';
      console.error('Import error:', err);
    } finally {
      this.isImporting = false;
    }
  }
} 