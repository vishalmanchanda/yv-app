import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, HostListener, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BuilderImageService } from '../../../../core/services/builder-image.service';

@Component({
  selector: 'app-image-uploader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="image-uploader">
      <div *ngIf="currentImageUrl" class="mb-3">
        <img [src]="currentImageUrl" class="img-fluid mb-2" alt="Current image">
        <button class="btn btn-danger btn-sm" (click)="removeImage()">Remove Image</button>
      </div>
      <div class="mb-3">
        <input type="file" (change)="onFileSelected($event)" accept="image/*" class="form-control">
      </div>
      <div
        class="drop-zone"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
        (paste)="onPaste($event)"
      >
        Drag and drop an image here or paste from clipboard
      </div>
    </div>
  `,
  styles: [`
    .image-uploader {
      max-width: 533px;
      margin: 0 auto;
      overflow-y: auto;
    }
    .drop-zone {
      border: 2px dashed #ccc;
      border-radius: 5px;
      padding: 25px;
      text-align: center;
      cursor: pointer;
    }
    .drop-zone.dragover {
      background-color: var(--bs-gray-100);
    }
  `]
})
export class ImageUploaderComponent implements OnChanges, OnInit {
  @Input() level: 'content' | 'part' | 'section' = 'content';
  @Input() partNumber?: number;
  @Input() sectionNumber?: string;
  @Input() contentId?: string;
  @Input() currentImageUrl: string | null = null;
  @Output() imageUploaded = new EventEmitter<{ level: 'content' | 'part' | 'section', partNumber?: number, sectionNumber?: number, imageUrl: string }>();
  @Output() imageRemoved = new EventEmitter<{ level: 'content' | 'part' | 'section', partNumber?: number, sectionNumber?: number }>();

  constructor(
    private builderImageService: BuilderImageService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (this.contentId) {
      this.loadExistingImage(this.contentId);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('BldrImageUploader changes:', changes);
    if (changes['currentImageUrl']) {
      console.log('New currentImageUrl:', this.currentImageUrl);
    }
    if (changes['level'] || changes['partNumber'] || changes['sectionNumber']) {
      console.log('Level or indices changed, current image:', this.currentImageUrl);
    }
  }

  async loadExistingImage(contentId: string) {
    
    try {
      if (this.level === 'content' && contentId) {
        this.currentImageUrl = await this.builderImageService.getContentCoverImageUrl(contentId);
      } else if (this.level === 'part' && this.partNumber !== undefined) {
        this.currentImageUrl = await this.builderImageService.getPartImageUrl(contentId, this.partNumber + 1);
      } else if (this.level === 'section' && this.partNumber !== undefined && this.sectionNumber !== undefined) {
        this.currentImageUrl = await this.builderImageService.getSectionImageUrl(contentId, this.partNumber + 1, parseInt(this.sectionNumber) + 1);
      }
      this.changeDetectorRef.detectChanges();
    } catch (error) {
      console.error('Error loading image:', error);
      this.currentImageUrl = null;
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.handleFile(input.files[0]);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const dropZone = event.target as HTMLElement;
    dropZone.classList.add('dragover');
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const dropZone = event.target as HTMLElement;
    dropZone.classList.remove('dragover');
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const dropZone = event.target as HTMLElement;
    dropZone.classList.remove('dragover');
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.handleFile(event.dataTransfer.files[0]);
    }
  }

  onPaste(event: ClipboardEvent) {
    const items = event.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            this.handleFile(blob);
          }
        }
      }
    }
  }

  handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      if (e.target && typeof e.target.result === 'string') {
        this.resizeAndCompressImage(e.target.result);
      }
    };
    reader.readAsDataURL(file);
  }

  resizeAndCompressImage(dataUrl: string) {
    console.log(`Original image size: ${dataUrl.length} bytes`);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size to 16:9 aspect ratio with 300px height
      canvas.height = 300;
      canvas.width = 533; // 16:9 aspect ratio

      // Calculate scaling and positioning
      const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
      const x = (canvas.width / 2) - (img.width / 2) * scale;
      const y = (canvas.height / 2) - (img.height / 2) * scale;

      // Draw image on canvas
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

      // Convert to compressed JPEG
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const reader = new FileReader();
            reader.onloadend = () => {
              if (typeof reader.result === 'string') {
                this.currentImageUrl = reader.result;
                this.imageUploaded.emit({
                  level: this.level,
                  partNumber: this.partNumber,
                  sectionNumber: this.sectionNumber ? parseInt(this.sectionNumber) : 0,
                  imageUrl: reader.result
                });
                // Trigger change detection
                this.changeDetectorRef.detectChanges();
              }
            };
            reader.readAsDataURL(blob);
            console.log(`Compressed image size: ${blob.size} bytes`);
          }
        },
        'image/jpeg',
        0.85 // Adjust compression quality (0.85 is a good balance between quality and file size)
      );
    };
    img.src = dataUrl;
  }

  removeImage() {
    this.currentImageUrl = null;
    this.imageRemoved.emit({
      level: this.level,
      partNumber: this.partNumber,
      sectionNumber: this.sectionNumber ? parseInt(this.sectionNumber) : 0
    });
    // Trigger change detection
    this.changeDetectorRef.detectChanges();
  }
}
