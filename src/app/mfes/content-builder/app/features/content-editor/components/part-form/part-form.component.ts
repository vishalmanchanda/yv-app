import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContentMetadata, Part } from '../../../../../../../core/models/content.models';
import { JsonViewComponent } from '../json-view/json-view.component';
import { AIFormComponent } from '../../../../shared/components/ai-form/ai-form.component';
import { GenAIService } from '../../../../../../../core/services/gen-ai.service';
import { firstValueFrom } from 'rxjs';
import { PromptTabsComponent } from '../../../content-creation/components/prompt-tabs/prompt-tabs.component';
import { ToastService } from '../../../../../../content-renderer/core/services/toast.service';


@Component({
  selector: 'app-part-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    JsonViewComponent,
    AIFormComponent,
    PromptTabsComponent
  ],
  template: `
    <div class="part-form-container d-flex flex-column">
      <!-- Header with Tabs -->
      <div class="editor-header border-bottom p-3">
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="mb-0">Edit Part</h5>
          
          <ul class="nav nav-tabs mb-0 border-bottom-0">
         
            <li class="nav-item">
              <a class="nav-link"     
                 [class.active]="currentView === 'form'"
                 (click)="switchView('form')"
                 (keyup.enter)="switchView('form')"
                 role="button"
                 tabindex="0">
                Part Editor
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" 
                 [class.active]="currentView === 'prompt'"
                 (click)="switchView('prompt')"
                 (keyup.enter)="switchView('prompt')"
                 role="button"
                 tabindex="0">
                Part Prompt 
              </a>
            </li>
           
          </ul>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="editor-content flex-grow-1 overflow-auto p-3">
        <!-- Form View -->
        <div *ngIf="currentView === 'form'" class="form-container">
          <div class="row">
            <div class="col-md-4">
          <form [formGroup]="partForm" class="editor-form">
            <div class="mb-3">
              <label class="form-label" for="title">Title</label>
              <input class="form-control" 
                     formControlName="title" 
                     placeholder="Enter part title">
            </div>

            <div class="mb-3">
              <label class="form-label" for="description">Description</label>
              <textarea class="form-control"
                        id="description"
                        formControlName="description"
                        placeholder="Enter part description"
                        rows="3">
              </textarea>
            </div>

            <div class="mb-3">
              <label class="form-label" for="tags">Tags</label>
              <input class="form-control"
                     id="tags"
                     formControlName="tags"
                     placeholder="Enter comma-separated tags">
            </div>

            <div class="mb-3">
              <label class="form-label" for="sectionCount">Section Count</label>
              <input type="number" 
                     id="sectionCount"
                     class="form-control" 
                     formControlName="sectionCount"
                     min="1">
              </div>
              <!-- View Sections Button -->
              <button class="btn btn-primary btn-sm" 
                  (click)="viewSections()"
                  [disabled]="loading">
            View Sections
          </button>
            </form>
          
            </div>
            <div class="col-md-8">
            <div class="json-view card">
              <div class="card-header">
                <div class="d-flex justify-content-between align-items-center">
                  <h5 class="mb-0">JSON View</h5>
                  <button class="btn btn-primary btn-sm" 
                  (click)="generatePartJson()"
                  [disabled]="loading">
                    Generate with AI
                  </button>
                </div>
              </div>
              <div class="card-body">
            <app-json-view
            [data]="part"
            (dataChange)="onJsonChange($event)">
          </app-json-view>
              </div>
            </div>
            </div>
          </div>
        </div>

        <!-- JSON View -->
        <div *ngIf="currentView === 'prompt'" class="h-100">
          <app-prompt-tabs
          [title]="partForm.get('title')?.value"
          [description]="partForm.get('description')?.value"
          type="part"
            (systemPromptChange)="onSystemPromptChange($event)"
            (userPromptChange)="onUserPromptChange($event)">
          </app-prompt-tabs>
        </div>

        <!-- AI View -->
        <div *ngIf="currentView === 'ai'" class="h-100">
          <app-ai-form  
            promptType="part"
            [initialData]="part"
            [metadata]="content"
            (generate)="onAIGenerate($event)">
  </app-ai-form>
</div>

      <!-- Updated Footer -->
      <div class="editor-footer border-top p-2 d-flex justify-content-end gap-2 fixed-bottom">
        <div class="d-flex justify-content-end gap-2">
          <button class="btn btn-outline-secondary btn-sm" 
                  (click)="canceled.emit()"
                  (keyup.enter)="canceled.emit()"
                  role="button"
                  tabindex="0"
                  [disabled]="loading">
            Cancel
          </button>
          <button class="btn btn-outline-primary btn-sm" 
                  (click)="resetForm()"
                  [disabled]="loading">
            Reset
          </button>
          <button class="btn btn-primary btn-sm" 
                  (click)="savePart()"
                  [disabled]="!isValid || loading">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .part-form-container {
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    .editor-content {
      flex: 1;
      overflow-y: auto;
      min-height: 0;
    }
    .editor-footer {
      background-color: var(--bs-body-bg);
    }
    .editor-form {
      max-width: 800px;
      margin: 0 auto;
    }
  `]
})
export class PartFormComponent implements OnChanges {
  @Input() part?: Part;
  @Input() content?: ContentMetadata;
  @Input() loading = false;
  @Output() save = new EventEmitter<Part>();
  @Output() canceled = new EventEmitter<void>();
  @Output() viewSectionsOfSelectedPart = new EventEmitter<void>();

  currentView: 'form' | 'ai' | 'prompt' = 'form';
  partForm: FormGroup = new FormGroup({});
  systemPrompt = '';
  userPrompt = '';
  context = '';

  constructor(private fb: FormBuilder, private genAiService: GenAIService, private toastService: ToastService) {
    this.initForm();
  }

  private initForm() {
    this.partForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      tags: [''],
      order: [1, [Validators.required, Validators.min(1)]],
      sections: [[]],
      sectionCount: [0]
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    // If part input changes
    if (changes['part'] && this.part) {
      // Update form if in form view
      if (this.currentView === 'form') {
        this.partForm.patchValue({
          title: this.part.title,
          description: this.part.description,
          tags: this.part.tags?.join(', '),
          sections: this.part.sections || [],
          sectionCount: this.part.sectionCount
        }, { emitEvent: false });
      }
      
      // If in AI view, force refresh by creating new reference
      if (this.currentView === 'ai') {
        this.part = { ...this.part };
      }
    }
  }

  switchView(view: 'form' | 'ai' | 'prompt') {
    this.currentView = view;
    
    // When switching to form view, update form with current part data
    if (view === 'form' && this.part) {
      this.partForm.patchValue({
        title: this.part.title,
        description: this.part.description,
        tags: this.part.tags?.join(', '),
        sections: this.part.sections || [],
        sectionCount: this.part.sectionCount
      }, { emitEvent: false });
    }
  }

  onJsonChange(updatedPart: Part) {
    this.part = updatedPart;
    this.partForm.patchValue({
      title: updatedPart.title,
      description: updatedPart.description,
      tags: updatedPart.tags?.join(', '),

    });
  }

  async generatePartJson() {
    try {
      if (this.part && this.systemPrompt && this.userPrompt) {
        this.loading = true;
      const aiResponse = await 
        this.genAiService.generatePart({
          title: this.part.title,
          description: this.part.description,
          context: this.context,
          language: this.content?.language || '',
          sectionCount: this.part.sectionCount,
          systemPrompt: this.systemPrompt,
          userPrompt: this.userPrompt
        }
      );
      const aiResponseJson = JSON.parse(aiResponse);
      this.onJsonChange(aiResponseJson);
      this.onAIGenerate(aiResponseJson);
      } else {
        this.toastService.show('Error generating part JSON', 'Please unable to generate part JSON as user prompt or system prompt is missing');
        console.error('Error generating part JSON: user prompt or system prompt is missing'+ this.userPrompt + ' ' + this.systemPrompt);
      }
    } catch ( error ) {
      console.error('Error generating part JSON:', error);
      this.toastService.show('Error generating part JSON', 'Something went wrong');
    } finally {
      this.loading = false;
    }
  }

  onAIGenerate(aiResponse: any) {
    if (aiResponse && this.part) {
      const updatedPart: Part = {
        ...this.part,
        title: aiResponse.title,
        description: aiResponse.description,
        sections: aiResponse.sections || [],
        tags: aiResponse.tags || [],
        sectionCount: aiResponse.sections?.length || 0
        
        // aiResponse: aiResponse
      };
      
      // Update local part reference
      this.part = updatedPart;
      
      // Update form
      this.partForm.patchValue({
        title: updatedPart.title,
        description: updatedPart.description,
        tags: updatedPart.tags?.join(', '),
        sections: updatedPart.sections || [],
        sectionCount: updatedPart.sectionCount
      }, { emitEvent: false });
      
      // Don't auto-save, let user click save button
      // this.save.emit(updatedPart);
    }
  }

  resetForm() {
    if (this.part) {
      this.partForm.patchValue({
        id: this.part.id,
        title: this.part.title,
        description: this.part.description,
        tags: this.part.tags?.join(', '),
        sections: this.part.sections || [],
        sectionCount: this.part.sectionCount
      });
    } else {
      this.partForm.reset({
        order: 1
      });
    }
  }

  savePart() {
    if (this.currentView === 'form' && this.part) {
      // When saving from AI view, use the current part data
      this.save.emit(this.part);
    } else if (this.partForm.valid) {
      // When saving from form view, use form data
      const formValue = this.partForm.value;
      const updatedPart: Part = {
        ...this.part,
        id: this.part?.id || 0,
        title: formValue.title,
        description: formValue.description,
        tags: formValue.tags?.split(',').map((tag: string) => tag.trim()).filter(Boolean) || [],
        sections: this.part?.sections || [],
        sectionCount: this.part?.sectionCount || 0
      };
      
      this.save.emit(updatedPart);
    }
  }

  get isValid(): boolean {
    if (this.currentView === 'ai') {
      return !!this.part?.title;
    }
    return this.currentView === 'prompt' ? !!this.part : this.partForm.valid;
  }

  onSystemPromptChange(prompt: string) {
    this.systemPrompt = prompt;
  }

  onUserPromptChange(prompt: string) {
    this.userPrompt = prompt;
  }

  viewSections() {
    this.viewSectionsOfSelectedPart.emit();
  }
} 
