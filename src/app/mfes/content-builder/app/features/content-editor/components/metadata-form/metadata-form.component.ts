import { Component, Input, Output, EventEmitter, SimpleChanges, OnInit, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContentMetadata, Part, PartMetadata, Section  } from '../../../../../../../core/models/content.models';

import { CommonModule } from '@angular/common';
import { JsonViewComponent } from '../json-view/json-view.component';
import { IndexedDbService } from '../../../../core/services/indexed-db.service';
import { AIFormComponent } from '../../../../shared/components/ai-form/ai-form.component';
import { PromptService } from '../../../content-creation/services/prompt.service';
import { PromptTabsComponent } from '../../../content-creation/components/prompt-tabs/prompt-tabs.component';
import { ImageUploaderComponent } from '../image-editor/bldr-image-uploader.component';
import { BuilderImageService } from '../../../../core/services/builder-image.service';
import { GenAIService } from '../../../../../../../core/services/gen-ai.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    JsonViewComponent,
    PromptTabsComponent,
    ImageUploaderComponent
  ],
  selector: 'app-metadata-form',
  template: `
    <div class="metadata-form-container d-flex flex-column h-100">
      <!-- Header with Tabs -->
      <div class="editor-header border-bottom p-3">
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="mb-0">Edit Metadata</h5>
          
          <ul class="nav nav-tabs mb-0 border-bottom-0">
            <li class="nav-item">
              <a class="nav-link" 
                 [class.active]="currentView === 'form'"
                 (click)="switchView('form')" 
                 (keyup.enter)="switchView('form')"
                 tabindex="0"
                 role="button">
                Metadata Form
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" 
                 [class.active]="currentView === 'prompt'"
                 (click)="switchView('prompt')"
                 (keyup.enter)="switchView('prompt')"
                 tabindex="0"
                 role="button">
                Prompt 
              </a>
            </li>
         
          </ul>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="editor-content flex-grow-1 overflow-auto p-3">
        <!-- Form View -->
        <div *ngIf="currentView === 'form'" class="form-container">
          <div class = "row">
            <div class = "col-md-4">
          <form [formGroup]="metadataForm" class="editor-form">
            <div class="mb-3">
              <label class="form-label" for="title">Title</label>
              <input class="form-control" 
                     id="title"
                     formControlName="title" 
                     placeholder="Enter title">
              <div class="invalid-feedback" *ngIf="metadataForm.get('title')?.hasError('required')">
                Title is required
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label" for="description">Description</label>
              <textarea class="form-control"
                        id="description"
                        formControlName="description"
                        placeholder="Enter description"
                        rows="3">
              </textarea>
            </div>

            <div class="mb-3">
              <label class="form-label" for="type">Content Type</label>
              <select class="form-select" 
                      id="type"
                      formControlName="type">
                <option value="book">Book</option>
                <option value="course">Course</option>
                <option value="article">Article</option>
              </select>
              <div class="invalid-feedback" *ngIf="metadataForm.get('type')?.hasError('required')">
                Content type is required
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label" for="language">Language</label>
              <select class="form-select" 
                      id="language"
                      formControlName="language">
                <option *ngFor="let lang of languages" [value]="lang.code">
                  {{lang.name}}
                </option>
              </select>
            </div>
            <!-- <app-image-uploader
              [contentId]="content?.id"
              (imageUploaded)="onImageUploaded($event)"
              (imageRemoved)="onImageRemoved($event)">
            </app-image-uploader> -->
          </form>
          </div>
          <div class = "col-md-8">
            <div class= "card">
              <div class= "card-header d-flex justify-content-between align-items-center">
                <h5 class= "card-title">JSON View</h5>
                <button class="btn btn-sm btn-primary" (click)="generateWithAI()" [disabled]="!isValid || loading">
                  Generate with AI
                </button>
              </div>
              <div class= "card-body">
                <app-json-view
                  [data]="content"
                  (dataChange)="onJsonChange($event)">
                </app-json-view>
              </div>
            </div>
          </div>
          </div>
        </div>
        <!-- JSON View -->
        <div *ngIf="currentView === 'prompt'" class="">
         <app-prompt-tabs
            type="metadata"
            title= "{{metadataForm.get('title')?.value}}"
            description= "{{metadataForm.get('description')?.value}}"
            language= "{{metadataForm.get('language')?.value}}"
            type= "metadata"
            (systemPromptChange)="onSystemPromptChange($event)"
            (userPromptChange)="onUserPromptChange($event)">
            >
          </app-prompt-tabs>
        </div>

        <!-- AI View -->
        <!-- <div *ngIf="currentView === 'prompt'" class="">
          <app-ai-form
            promptType="metadata"
            [initialData]="content"
            (generate)="onAIGenerate($event)">
          </app-ai-form>
        </div> -->
      </div>

      <!-- Bottom Toolbar -->
      <div class="editor-footer border-top p-3 fixed-bottom">
        <div class="d-flex justify-content-between align-items-center">
          <div class="d-flex align-items-center">
            <div class="save-status text-muted" *ngIf="loading">
              <div class="spinner-border spinner-border-sm me-2"></div>
              <span>Saving changes...</span>
            </div>
            <div class="save-status text-success" *ngIf="!loading">
              <i class="bi bi-check2-circle me-2"></i>
              <span>All changes saved</span>
            </div>
          </div>
          <div class="d-flex gap-2">
            <button class="btn btn-secondary" (click)="resetForm()">
              Reset
            </button>
           
            <button class="btn btn-primary" 
                    (click)="saveChanges()"
                    [disabled]="!isValid || loading">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .metadata-form-container {
      height: 100%;

    }

    .editor-content {
      min-height: 68vh;
    }

    .editor-footer {
      flex-shrink: 0;
;
      box-shadow: 0 -2px 10px rgba(0,0,0,.05);
    }

    .nav-tabs {
      border-bottom: none;
      
      .nav-link {
        border: none;
        color: var(--bs-gray-600);
        padding: 0.5rem 1rem;
        cursor: pointer;
        
        &:hover {
          color: var(--bs-primary);
          background-color: transparent;
        }
        
        &.active {
          color: var(--bs-primary);
          font-weight: 500;
          position: relative;
          
          &:after {
            content: '';
            position: absolute;
            bottom: -1px;
            left: 0;
            right: 0;
            height: 2px;
            background-color: var(--bs-primary);
          }
        }
      }
    }

    .form-control, .form-select {
      border-color: var(--bs-gray-300);
      
      &:focus {
        border-color: var(--bs-primary);
        box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.1);
      }
    }
  `]
})
export class MetadataFormComponent implements OnInit, OnChanges {
  @Input() content?: ContentMetadata;
  @Input() loading = false;
  @Output() save = new EventEmitter<Partial<ContentMetadata>>();


  coverImageUrl= '';
  metadataForm: FormGroup = new FormGroup({});
  promptForm: FormGroup = new FormGroup({});
  currentView: 'form' | 'prompt' = 'form';
  selectedPart:  number | null = null;
  selectedSection: number | null = null;
  selectedLevel: 'content' | 'part' | 'section' = 'content';
  systemPrompt= '';
  userPrompt = '';

  languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'hi', name: 'Hindi' }
  ];
  
  get isValid(): boolean {
    return this.currentView === 'form' ? this.metadataForm.valid : true;
  }

  constructor(
    private fb: FormBuilder,
    private indexedDb: IndexedDbService,
    private genAiService: GenAIService,
    private toastService: ToastService,

    private builderImageService: BuilderImageService
  ) {
    this.initForm();
  }

  private initForm() {
    this.metadataForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      type: ['book', Validators.required],
      authors: [[]],
      createdAt: [''],
      updatedAt: [''],
      partsMetadata: [[]],
      language: ['en', Validators.required],
    });

    this.promptForm = this.fb.group({
      systemPrompt: [''],
      userPrompt: ['']
    });
  }

  switchView(view: 'form' | 'prompt') {
    this.currentView = view;
  }

  onJsonChange(newData: any) {
    this.content = newData;
    this.metadataForm.patchValue(newData, { emitEvent: false });
  }

  async saveChanges() {
    if (!this.content?.id) {
      console.error('No content ID available');
      return;
    }

    let updatedMetadata: ContentMetadata;

    if (this.currentView === 'form' && this.metadataForm.valid) {
      updatedMetadata = {
        ...this.content,
        ...this.metadataForm.value,
        id: this.content.id,
      
      };
    } else if (this.currentView === 'prompt' && this.content) {
      updatedMetadata = {
        ...this.content,
        id: this.content.id,
       
      };
    } else {
      return;
    }
try {
      await this.createPartsIfNotExists(updatedMetadata);
  
  // Emit the updated metadata
      this.save.emit(updatedMetadata);
  
    } catch (error) {
      console.error('Error saving parts:', error);
      // You might want to show an error message to the user here
    }
  }

async  createPartsIfNotExists(contentMetadata: ContentMetadata) {
  try {
    // Get existing parts for this content
    if (!this.content?.id) {
      console.error('No content ID available');
      return;
    }
    const existingParts = await this.indexedDb.getParts(this.content.id) || [];
    const existingPartIds = new Set(existingParts.map(p => p.id));

    // Create or update parts based on partsMetadata
    if (contentMetadata.partsMetadata?.length) {
      const partPromises = contentMetadata.partsMetadata.map(async (partMeta: PartMetadata) => {
        // Check if part already exists
        if (!existingPartIds.has(partMeta.id)) {
          // Create new part with empty sections
          const newPart: Part = {
            id: partMeta.id,
            title: partMeta.title,
            description: partMeta.description,
            sections: Array(partMeta.sectionCount).fill(null).map((_, index) => ({
              id: (index + 1).toString(),
              title: `Section ${index + 1}`,
              content: 'This is the placeholder content of section ' + (index + 1),
              type: 'default',
              subsections: [],
              order: index + 1
            })),
            tags: partMeta.tags || [],
            sectionCount: partMeta.sectionCount
          };
          if (this.content) {
            await this.indexedDb.savePart(this.content.id, newPart);
          }
        }
      });

      await Promise.all(partPromises);
    }

  } catch (error) {
    console.error('Error creating parts:', error);
  }
}
    

  resetForm()  {
    if (this.content) {
      this.metadataForm.patchValue(
        this.content
      );
      this.promptForm.reset();
    } else {
      this.metadataForm.reset(this.emptyMetadata());
    }
  }

  emptyMetadata() : ContentMetadata {
    return {
      type: 'book',
      authors: [],
      partsMetadata: [],
      createdAt: '',
      updatedAt: '',
      id: '',
      coverImage: '',
      description: '',
      title: '',
      categoryKey: '',
      status: 'draft',
      language: 'en',
      zipUrl: '',
      version: '1.0',
      keywords: [],
      audios_path: '',
      
    };
  }

  ngOnInit() {
    if (this.content) {
      this.metadataForm.patchValue(this.content);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['content'] && !changes['content'].firstChange) {
      this.metadataForm.patchValue(this.content || this.emptyMetadata());
    }
  }

  // Helper method to create empty sections for a part
  private createEmptySections(count: number): Section[] {
    return Array(count).fill(null).map((_, index) => ({
      id: (index + 1).toString(),
      title: `Section ${index + 1}`,
      content: '',
      type: 'default',
      subsections: [],
      order: index + 1
    }));
  }

  async onAIGenerate() {
    try {
      this.loading = true;
      // Call your AI service here
   //   const response = await this.genAiService.generateMetadata(data);

      const response = await this.genAiService.generateMetadata({
        title: this.metadataForm.get('title')?.value,
        description: this.metadataForm.get('description')?.value,
        language: this.metadataForm.get('language')?.value,
        systemPrompt: this.promptForm.get('systemPrompt')?.value,
        userPrompt: this.promptForm.get('userPrompt')?.value
      });
      
      const jsonResponse = JSON.parse(response);
      
      if (jsonResponse) {
        // Update the content with AI-generated data
        // remove the systemPrompt and userPrompt from the jsonResponse
        
        this.content = {
         ...this.content,
          ...jsonResponse
        };
        
        this.metadataForm.patchValue(jsonResponse);
      }
    } catch (error) {
      console.error('Error generating metadata:', error);
    } finally {
      this.loading = false;
    }
  }

  async generateWithAI(): Promise<void> {
    // open the new chrome tab with the url of gemini or claude or gpt
    await this.onAIGenerate();
  }

  

  onSystemPromptChange(prompt: string) {
    this.promptForm.get('systemPrompt')?.setValue(prompt);
  }

  onUserPromptChange(prompt: string) {
    this.promptForm.get('userPrompt')?.setValue(prompt);
  }
} 
