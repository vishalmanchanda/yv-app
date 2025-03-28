import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ContentBuilderService } from '../../../../core/services/content-builder.service';

import { Observable, take } from 'rxjs';
import { CommonModule } from '@angular/common';
import { PartListComponent } from '../part-list/part-list.component';
import { EditorContentComponent } from '../editor-content/editor-content.component';
import { ImageUploaderComponent } from '../image-editor/bldr-image-uploader.component';
import { BuilderImageService } from '../../../../core/services/builder-image.service';
import { ContentMetadata, Section } from '../../../../../../../core/models/content.models';
import { Part } from '../../../../../../../core/models/content.models';


@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [
    CommonModule,
    PartListComponent,
    EditorContentComponent,
    ImageUploaderComponent

  ],
  template: `
    <div class="container-fluid h-100 p-0" style="overflow: hidden;">
      <div class="row h-100 g-0">
        <!-- Sidebar -->
        <div class="col-3 border-end sidebar">
          <app-part-list
            [content]="activeContent$ | async"
            [selectedPartId]="selectedPartId$ | async"
            (partSelected)="onPartSelected($event)"
            (addPartClicked)="onAddPart()"
          ></app-part-list>
        </div>

        <!-- Main Content -->
        <div class="col-9 main-content h-100">
          <div *ngIf="error$ | async as error" class="alert alert-danger m-3">
            {{ error }}
          </div>

          <!-- <app-image-uploader
            [contentId]="(activeContent$ | async)?.id ?? '' "
            [partNumber]="(selectedPartId$ | async) ?? undefined"
            [sectionNumber]="(activeSection$ | async)?.id ?? undefined"
            [level]="selectedLevel"
            [currentImageUrl]="coverImageUrl"
            (imageUploaded)="onImageUploaded( content!, $event )"
            (imageRemoved)="onImageRemoved( content!, $event )"
          ></app-image-uploader> -->

          <app-editor-content
            [content]="activeContent$ | async"
            [part]="activePart$ | async"
            [selectedPartId]="selectedPartId$ | async"
            [activeSection]="activeSection$ | async"
            [loading]="(loading$ | async) || false"
            [saving]="(saving$ | async) || false"
            [error]="error$ | async"
            (metadataUpdate)="onMetadataUpdate($event)"
            (partUpdate)="onPartUpdate($event)"
            (sectionUpdate)="onSectionUpdate($event)"
            (sectionSelected)="onSectionSelected($event)"
          ></app-editor-content>
        </div>
      </div>
    </div>
  `
})
export class EditorComponent implements OnInit, OnChanges {
  activeContent$: Observable<ContentMetadata | null>;
  selectedPartId$: Observable<number | null>;
  activeSection$: Observable<Section | null>;
  activePart$: Observable<Part | null>;
  loading$: Observable<boolean>;
  saving$: Observable<boolean>;
  error$: Observable<string | null>;
  isDirty$: Observable<boolean>;
  lastSaved$: Observable<Date | null>;

  selectedLevel: 'content' | 'part' | 'section' = 'content';
  selectedPart: number | null = null;
  selectedSection: number | null = null;
  coverImageUrl: string = '';
  
  content: ContentMetadata | null = null;

  constructor(
    private route: ActivatedRoute,
    private contentService: ContentBuilderService,
    private builderImageService: BuilderImageService
  ) {
    this.activeContent$ = this.contentService.activeContent$;
    this.selectedPartId$ = this.contentService.selectedPartId$;
    this.activeSection$ = this.contentService.activeSection$;
    this.activePart$ = this.contentService.activePart$;
    this.loading$ = this.contentService.loading$;
    this.saving$ = this.contentService.saving$;
    this.error$ = this.contentService.error$;
    this.isDirty$ = this.contentService.isDirty$;
    this.lastSaved$ = this.contentService.lastSaved$;
  }

  ngOnInit() {
    const contentId = this.route.snapshot.params['id'];
    if (contentId) {
      this.contentService.loadContent(contentId).then(() => {
        this.activeContent$.pipe(take(1)).subscribe(content => {
          this.content = content;
          if (content?.partsMetadata?.[0]) {
            this.onPartSelected(content.partsMetadata[0].id);
          }
        });
      });
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('EditorComponent ngOnChanges', changes);
    // if (this.content) {
    //   this.updateCoverImageUrl(this.content);
    // }

  }

  async onPartSelected(partId: number) {
    const contentId = this.route.snapshot.params['id'];
    if (contentId) {

      await this.contentService.loadPart(contentId, partId);      
    }
  }

  async onSectionSelected(section: Section) {
    const contentId = this.route.snapshot.params['id'];
    if (contentId) {
      this.contentService.setActiveSection(section);
    }
  }

  onMetadataUpdate(metadata: Partial<ContentMetadata>) {
    const contentId = this.route.snapshot.params['id'];
    if (contentId) {
      this.contentService.updateContentMetadata(contentId, metadata)
        .catch(error => {
          console.error('Error updating metadata:', error);
        });
    }
  }

  onSectionUpdate(event: any) {
    const contentId = this.route.snapshot.params['id'];
    this.contentService.updateSection(
      contentId,
      event.partId,
      event.sectionId,
      event.changes
    );
  }

  onPartUpdate(event: {partId: number, changes: Partial<Part>}) {
    const contentId = this.route.snapshot.params['id'];
    if (contentId) {
      this.contentService.updatePart(contentId, event.partId, event.changes);
    }
  }

  async onAddPart() {
    const contentId = this.route.snapshot.params['id'];
    if (contentId) {
      await this.contentService.addPart(contentId);
    }
  }

  async onImageUploaded(content: ContentMetadata, imageData: { level: 'content' | 'part' | 'section', partNumber?: number, sectionNumber?: number, imageUrl: string }) {
    if (!content) {
      console.error('Content is not available');
      return;
    }
    const contentId = content.id;
    let imagePath: string;
    if (imageData.level === 'content') {
      imagePath = 'bookCover.jpg';
      content.coverImage = imageData.imageUrl;
    } else if (imageData.level === 'part') {
      const partNumber = (imageData.partNumber !== undefined) ? imageData.partNumber + 1 : 1;
      imagePath = `${partNumber}.jpg`;
      if (this.selectedPart === imageData.partNumber) {
        this.coverImageUrl = imageData.imageUrl;
      }
    } else if (imageData.level === 'section') {
      const partNumber = (imageData.partNumber !== undefined) ? imageData.partNumber + 1 : 1;
      const sectionNumber = (imageData.sectionNumber !== undefined) ? imageData.sectionNumber + 1 : 1;
      imagePath = `${partNumber}/section${sectionNumber}.jpg`;
      if (this.selectedSection === imageData.sectionNumber) {
        this.coverImageUrl = imageData.imageUrl;
      }
    } else {
      console.error('Invalid image upload data');
      return;
    }

    try {
      // Convert data URL to Blob
      const response = await fetch(imageData.imageUrl);
      const blob = await response.blob();

      // Save the image to IndexedDB
      await this.builderImageService.uploadImage(contentId, imagePath, blob);

      console.log(`Image uploaded successfully: ${imagePath}`);

      // Save to local storage
      this.builderImageService.uploadImage(contentId, imagePath, blob);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
    await this.updateCoverImageUrl(content);
  }


  private async updateCoverImageUrl(content: ContentMetadata) {
    if (!content) return;

    const contentId = content.id;
    
    try {
      if (this.selectedLevel === 'content') {
        this.coverImageUrl = await this.builderImageService.getContentCoverImageUrl(contentId);
      } else if (this.selectedLevel === 'part' && this.selectedPart !== null) {
        this.coverImageUrl = await this.builderImageService.getPartImageUrl(contentId, this.selectedPart + 1);
      } else if (this.selectedLevel === 'section' && this.selectedSection !== null) {
        this.coverImageUrl = await this.builderImageService.getSectionImageUrl(contentId, this.selectedPart ?? 0 + 1, this.selectedSection ?? 0 + 1);
      }else{
        this.coverImageUrl = content.coverImage;
      }
      console.log('Updated cover image URL:', this.coverImageUrl);
    } catch (error) {
      console.error('Error updating cover image URL:', error);
      this.coverImageUrl = '';
    }
  }

  // 

  async onImageRemoved(content: ContentMetadata, imageData: { level: 'content' | 'part' | 'section', partNumber?: number, sectionNumber?: number }) {
    if (!content) {
      console.error('Content is not available');
      return;
    }

      const contentId = content.id;
    let imagePath: string;

    if (imageData.level === 'content') {
      imagePath = 'bookCover.jpg';
      this.coverImageUrl = '';
    } else if (imageData.level === 'part') {
      const partNumber = (imageData.partNumber !== undefined) ? imageData.partNumber + 1 : 1;
      imagePath = `${partNumber}.jpg`;
      if (this.selectedPart === imageData.partNumber) {
        this.coverImageUrl = '';
      }
    } else if (imageData.level === 'section') {
      const partNumber = (imageData.partNumber !== undefined) ? imageData.partNumber + 1 : 1;
      const sectionNumber = (imageData.sectionNumber !== undefined) ? imageData.sectionNumber + 1 : 1;
      imagePath = `${partNumber}/section${sectionNumber}.jpg`;
      if (this.selectedPart === imageData.partNumber && this.selectedSection === imageData.sectionNumber) {
        this.coverImageUrl = '';  
      }
    } else {
      console.error('Invalid image removal data');
      return;
    }

    try {
      // Remove the image from IndexedDB
      await this.builderImageService.removeImage(contentId, imagePath);
      console.log(`Image removed successfully: ${imagePath}`);

      // Update local storage
;
    } catch (error) {
      console.error('Error removing image:', error);
    }
    await this.updateCoverImageUrl(content);
  }
} 
