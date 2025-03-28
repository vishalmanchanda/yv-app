import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SectionEditorComponent } from '../section-editor/section-editor.component';
import { PartFormComponent } from '../part-form/part-form.component';
import { MetadataFormComponent } from '../metadata-form/metadata-form.component';
import { JsonViewComponent } from '../json-view/json-view.component';
import { Section } from '../../../../../../../core/models/content.models';
import { ContentMetadata } from '../../../../../../../core/models/content.models';
import { Part } from '../../../../../../../core/models/content.models';


@Component({
  selector: 'app-editor-content',
  standalone: true,
  imports: [
    CommonModule,
    SectionEditorComponent,
    PartFormComponent,
    MetadataFormComponent,
    JsonViewComponent
  ],
  template: `
    <div class="editor-content">
      <ul class="nav nav-tabs mb-3">
      <li class="nav-item">
          <a class="nav-link" 
             [class.active]="activeTab === 'part'"
             (click)="setActiveTab('part')"
             role="button"
             tabindex="0"
             (keyup.enter)="setActiveTab('part')">
            Part
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" 
             [class.active]="activeTab === 'sections'"
             (click)="setActiveTab('sections')"
             role="button"
             tabindex="0"
             (keyup.enter)="setActiveTab('sections')">
            Sections
          </a>
        </li>       
        <li class="nav-item">
          <a class="nav-link" 
             [class.active]="activeTab === 'metadata'"
             (click)="setActiveTab('metadata')"
             role="button"
             tabindex="0"
             (keyup.enter)="setActiveTab('metadata')">
            Metadata
          </a>
        </li>
      </ul>

      <div class="tab-content position-relative">
        <!-- Loading indicator -->
        <div *ngIf="loading" class="progress">
          <div class="progress-bar progress-bar-striped progress-bar-animated w-100"></div>
        </div>

        <div class="d-flex">
          <!-- Form Area -->
          <div class="form-area flex-grow-1">
            <!-- Section Editor -->
            <div *ngIf="activeTab === 'sections'">
              <app-section-editor
                *ngIf="selectedPartId"
                [content]="content"
                [part]="part"
                [partId]="selectedPartId"
                [saving]="saving"
                [error]="error"
                (sectionUpdate)="sectionUpdate.emit($event)"
                (sectionSelected)="sectionSelected.emit($event)"
              ></app-section-editor>
            </div>

            <!-- Part Form -->
            <div *ngIf="activeTab === 'part' && content && part">
              <app-part-form
                [part]="part || undefined"
                [loading]="loading"
                [content]="content || undefined"
                (viewSectionsOfSelectedPart)="viewSectionsOfSelectedPart()"
                (save)="handlePartUpdate({ partId: part.id || 0, changes: $event })"
                (onCancel)="onCancel()">
              </app-part-form>
            </div>

            <!-- Metadata Form -->
            <div *ngIf="activeTab === 'metadata'" class="h-100">
              <app-metadata-form
                [content]="content || undefined"
                [loading]="saving"
                (save)="metadataUpdate.emit($event)"
              ></app-metadata-form>
            </div>
          </div>

         

     
      </div>
    </div>
  `,
  styles: [`
    .editor-content {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .tab-content {
      flex: 1;
      overflow: hidden;
    }

    .form-area {
      height: 100%;
    }

    .nav-link {
      cursor: pointer;
    }

    .json-view {
      width: 400px;
      border-left: 1px solid #dee2e6;
      transition: width 0.3s ease;
    }

    .json-view.expanded {
      width: 600px;
    }

    .json-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 1rem;
      border-bottom: 1px solid #dee2e6;
    }
  `]
})
export class EditorContentComponent {
  @Input() content: ContentMetadata | null = null;
  @Input() part: Part | null = null;
  @Input() selectedPartId: number | null = null;
  @Input() activeSection: Section | null = null;
  @Input() loading = false;
  @Input() saving = false;
  @Input() error: string | null = null;

  @Output() sectionUpdate = new EventEmitter<any>();
  @Output() partUpdate = new EventEmitter<{partId: number, changes: Partial<Part>}>();
  @Output() metadataUpdate = new EventEmitter<Partial<ContentMetadata>>();
  @Output() sectionSelected = new EventEmitter<Section>();

  activeTab: 'sections' | 'part' | 'metadata' = 'part';
  showJson = false;
  expandedJson = false;

  setActiveTab(tab: 'sections' | 'part' | 'metadata') {
    this.activeTab = tab;
  }

  onSectionSelect(section: Section) {
    this.sectionSelected.emit(section);
    this.activeSection = section;
  }

  getJsonData() {
    switch (this.activeTab) {
      case 'sections':
        return this.activeSection || { message: 'No section selected' };
      case 'part':
        return this.part || { message: 'No part selected' };
      case 'metadata':
        return this.content || { message: 'No content loaded' };
      default:
        return {};
    }
  }

  handlePartUpdate(event: {partId: number, changes: Partial<Part>}) {
    this.partUpdate.emit(event);
  }

  viewSectionsOfSelectedPart() {
    this.activeTab = 'sections';
  }

  onCancel() {
    this.activeTab = 'part';
  }
} 
