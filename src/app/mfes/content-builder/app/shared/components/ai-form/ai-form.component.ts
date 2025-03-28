import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { PromptService, PromptType } from '../../../features/content-creation/services/prompt.service';
import { ContentMetadata, Part } from '../../../../../../core/models/content.models';
import { GenAIService } from '../../../../../../core/services/gen-ai.service';
import { ContentBuilderService } from '../../../core/services/content-builder.service';
import { JsonPipe } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';


@Component({
  selector: 'app-ai-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, JsonPipe],
  template: `
    <div class="ai-form">
      <!-- Tabs -->
      <ul class="nav nav-tabs mb-3">
        <li class="nav-item">
          <a class="nav-link" 
             [class.active]="currentTab === 'form'"
             (click)="currentTab = 'form'"
             href="javascript:void(0)">Form</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" 
             [class.active]="currentTab === 'prompts'"
             (click)="currentTab = 'prompts'"
             href="javascript:void(0)">Prompts</a>
        </li>
      </ul>

      <!-- Form Tab -->
      <div *ngIf="currentTab === 'form'">
        <form [formGroup]="form" class="mb-4">
          <div class="mb-3">
            <label class="form-label" for="title">Title</label>
            <input class="form-control" 
                   formControlName="title" 
                   placeholder="Enter title">
          </div>

          <div class="mb-3">
            <label class="form-label" for="description">Description</label>
            <textarea class="form-control" 
                      formControlName="description" 
                      rows="3"
                      placeholder="Enter description"></textarea>
          </div>

          <div class="mb-3">
            <label class="form-label" for="context">Context (Optional)</label>
            <textarea class="form-control" 
                      formControlName="context" 
                      rows="2"
                      placeholder="Additional context for AI"></textarea>
          </div>

          <div class="mb-4">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <label class="form-label mb-0" for="aiResponse">AI Response</label>
              <div class="btn-group">
                <button class="btn btn-sm btn-outline-secondary" 
                        (click)="toggleEditMode()"
                        [class.active]="isEditing">
                  <i class="bi" [class.bi-pencil]="!isEditing" [class.bi-check-lg]="isEditing"></i>
                  {{ isEditing ? 'Save Edits' : 'Edit' }}
                </button>
                <button class="btn btn-sm btn-primary" 
                        (click)="parseAndApplyResponse()"
                        [disabled]="isGeneratingResponse">
                  <span *ngIf="isGeneratingResponse" class="spinner-border spinner-border-sm me-1"></span>
                  {{ isGeneratingResponse ? 'Generating...' : 'Generate Response' }}
                </button>
              </div>
            </div>



            <!-- Editable JSON view -->
            <ng-container *ngIf="isEditing; else readOnlyView">
              <textarea
                class="form-control font-monospace"
                style="min-height: 200px; tab-size: 2; white-space: pre;"
                [formControl]="jsonEditControl"
                [class.is-invalid]="!isValidJson"
                spellcheck="false"
              ></textarea>
              <div class="invalid-feedback" *ngIf="!isValidJson">
                Invalid JSON format
              </div>
            </ng-container>

            <!-- Read-only JSON view -->
            <ng-template #readOnlyView>
              <pre class="form-control" style="min-height: 200px"><code>{{prettyJsonResponse}}</code></pre>
            </ng-template>


          </div>
        </form>

        <!-- <div class="mb-3">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <label class="form-label mb-0" for="aiResponse">AI Response</label>
          </div>
          <pre class="form-control" style="min-height: 200px"><code>{{parsedResponse}}</code></pre>
        </div> -->
      </div>

      <!-- Prompts Tab -->
      <div *ngIf="currentTab === 'prompts'" class="prompts mb-4">
        <form [formGroup]="promptsForm">
          <!-- System Prompt -->
          <div class="card mb-3">
            <div class="card-header d-flex justify-content-between align-items-center">
              <span>System Prompt</span>
              <button class="btn btn-sm btn-outline-secondary" 
                      (click)="copyPrompt('system')"
                      [class.btn-success]="copySuccess.system">
                <i class="bi" [class.bi-clipboard]="!copySuccess.system" [class.bi-check-lg]="copySuccess.system"></i>
                {{copySuccess.system ? 'Copied!' : 'Copy'}}
              </button>
            </div>
            <div class="card-body">
              <textarea class="form-control" 
                        formControlName="systemPrompt"
                        rows="6"></textarea>
            </div>
          </div>

          <!-- User Prompt -->
          <div class="card mb-3">
            <div class="card-header d-flex justify-content-between align-items-center">
              <span>User Prompt</span>
              <button class="btn btn-sm btn-outline-secondary" 
                      (click)="copyPrompt('user')"
                      [class.btn-success]="copySuccess.user">
                <i class="bi" [class.bi-clipboard]="!copySuccess.user" [class.bi-check-lg]="copySuccess.user"></i>
                {{copySuccess.user ? 'Copied!' : 'Copy'}}
              </button>
            </div>
            <div class="card-body">
              <textarea class="form-control" 
                        formControlName="userPrompt"
                        rows="6"></textarea>
            </div>
          </div>

          <div class="text-end mb-3">
            <button class="btn btn-outline-secondary me-2" 
                    (click)="resetPrompts()">
              Reset to Default
            </button>
            <button class="btn btn-outline-primary" 
                    (click)="copyPrompt('combined')"
                    [class.btn-success]="copySuccess.combined">
              <i class="bi" [class.bi-clipboard]="!copySuccess.combined" [class.bi-check-lg]="copySuccess.combined"></i>
              {{copySuccess.combined ? 'Copied!' : 'Copy Both Prompts'}}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .ai-form {
      height: 68vh;
      overflow-y: auto;
      padding: 1rem;
    }
    pre {
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    pre code {
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    .nav-link {
      cursor: pointer;
    }
    textarea {
      font-family: monospace;
    }
    .font-monospace {
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    }
    textarea.form-control {
      tab-size: 2;
      white-space: pre;
      overflow-wrap: normal;
      overflow-x: auto;
    }
    .is-invalid {
      border-color: var(--bs-danger);
    }
    .invalid-feedback {
      display: block;
    }
  `]
})
export class AIFormComponent implements OnInit, OnChanges {
  @Input() promptType: PromptType = 'metadata';
  @Input() initialData?: any;
  @Input() metadata?: ContentMetadata;
  @Input() parentPart?: Part;
  @Output() generate = new EventEmitter<any>();

  form: FormGroup;
  systemPrompt = '';
  userPrompt = '';
  combinedPrompt = '';
  parsedResponse: any = null;
  isGeneratingResponse = false;
  copySuccess = {
    system: false,
    user: false,
    combined: false
  };

  private rawSystemPrompt = '';
  private rawUserPrompt = '';

  // Language mapping for prompts
  private languageNames = {
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'zh': 'Chinese',
    'ja': 'Japanese',
    'hi': 'Hindi'
  };

  currentTab: 'form' | 'prompts' = 'form';
  promptsForm: FormGroup;

  isEditing = false;
  isValidJson = true;

  jsonEditControl = new FormControl('', {
    updateOn: 'blur'  // Only update on blur to prevent constant parsing while typing
  });

  constructor(
    private fb: FormBuilder,
    private promptService: PromptService,
    private genAiService: GenAIService,
    private contentService: ContentBuilderService,
    private toastr: ToastService
  ) {
    // Main form
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      context: [''],
      aiResponse: ['']
    });

    // Prompts form
    this.promptsForm = this.fb.group({
      systemPrompt: [''],
      userPrompt: ['']
    });

    // Subscribe to prompts form changes
    this.promptsForm.valueChanges.subscribe(value => {
      this.systemPrompt = value.systemPrompt;
      this.userPrompt = value.userPrompt;
      this.combinedPrompt = `System Prompt:\n${value.systemPrompt}\n\nUser Prompt:\n${value.userPrompt}`;
    });

    // Subscribe to JSON edit changes
    this.jsonEditControl.valueChanges.subscribe(value => {
      if (value) {
        this.updateJsonResponse(value);
      }
    });
  }

  async ngOnInit() {
    // First load the prompts
    this.loadPrompts().then(() => {
      // Then set initial values and update prompts
      if (this.initialData) {
        this.form.patchValue({
          title: this.initialData.title || '',
          description: this.initialData.description || '',

        });
      }     
      // Update prompts with initial values
      this.updatePrompts();
    });

    if (this.promptType === 'part') {
    // Load the part
    //await this.contentService.loadPart(this.initialData?.contentId, this.initialData?.id);

      this.contentService.activePart$.subscribe((part) => {
        if (part) {
          this.parsedResponse = JSON.stringify(part);
          this.initialData = part;
        }
      });
    } else if (this.promptType === 'section' && this.parentPart) {
      // Load the section
     // await this.contentService.loadPart(this.initialData?.contentId, this.initialData?.id);

      this.contentService.activeSection$.subscribe((section) => {
        if (section) {
          this.parsedResponse = JSON.stringify(section);
          this.initialData = section;
        }
      });
    }

    // Set initial AI response if available
    if (this.parsedResponse) {
      this.form.get('aiResponse')?.setValue(this.parsedResponse);
    }

    // Subscribe to form changes for subsequent updates
    this.form.valueChanges.subscribe(() => {
      this.updatePrompts();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    // Check if initialData has changed
    if (changes['initialData'] && this.initialData) {
      this.form.patchValue({
        title: this.initialData.title || '',
        description: this.initialData.description || '',
        context: this.form.get('context')?.value || '',
        aiResponse: this.parsedResponse
        
         // Preserve existing context if any
      }, { emitEvent: false });
    }

    // Check if metadata or parentPart changed
    if ((changes['metadata'] && this.metadata) || 
        (changes['parentPart'] && this.parentPart) ||
        changes['initialData']) {
      this.updatePrompts();
    }

    if (changes['parsedResponse'] && this.parsedResponse) {
      this.form.get('aiResponse')?.setValue(this.parsedResponse);
    }

    if (changes['userPrompt'] && this.userPrompt) {
      this.promptsForm.get('userPrompt')?.setValue(this.userPrompt);
    }

    if (changes['systemPrompt'] && this.systemPrompt) {
      this.promptsForm.get('systemPrompt')?.setValue(this.systemPrompt);
    }
  }

  private async loadPrompts() {
    try {
      // Only load prompts if they haven't been edited
      if (!this.promptsForm.get('systemPrompt')?.value && !this.promptsForm.get('userPrompt')?.value) {
        // Load both prompts and store their raw versions
        const [systemPrompt, userPrompt] = await Promise.all([
          this.promptService.getSystemPrompt(this.promptType).toPromise(),
          this.promptService.getUserPrompt(this.promptType).toPromise()
        ]);

        this.rawSystemPrompt = systemPrompt || '';
        this.rawUserPrompt = userPrompt || '';

        // Initial update of the prompts
        this.updatePrompts();
      }
    } catch (error) {
      console.error('Error loading prompts:', error);
    }
  }

  private updatePrompts() {
    const langCode = this.metadata?.language || 'en';
    const languageName = this.languageNames[langCode as keyof typeof this.languageNames] || 'English';

    const data = {
      title: this.form.get('title')?.value || '',
      description: this.form.get('description')?.value || '',
      context: this.form.get('context')?.value || '',
      language: languageName
    };

    // Add metadata context
    const metadataContext = this.metadata ? 
      `Content Title: ${this.metadata.title}
Content Description: ${this.metadata.description}
Target Language: ${languageName}
` : '';

    let sectionCount = 1;
    if (this.metadata?.partsMetadata[this.initialData?.id] ) {
      
      sectionCount = this.metadata?.partsMetadata[this.initialData?.id].sectionCount ?? 1;
    }
      // Add part context for sections
      const partContext = this.promptType === 'section' && this.parentPart ? 
      `Part Title: ${this.parentPart.title}
Part Description: ${this.parentPart.description}
Section Count to be generated: ${sectionCount}
` : '';

    // Check if prompts have been edited
    const currentSystemPrompt = this.promptsForm.get('systemPrompt')?.value;
    const currentUserPrompt = this.promptsForm.get('userPrompt')?.value;

    // Only update prompts if they haven't been edited
    if (!currentSystemPrompt && !currentUserPrompt) {
      this.systemPrompt = this.promptService.generatePrompt(this.rawSystemPrompt, {
        ...data,
        metadataContext: metadataContext,
        partContext: partContext
      });

      this.userPrompt = this.promptService.generatePrompt(this.rawUserPrompt, {
        ...data,
        metadataContext: metadataContext,
        partContext: partContext
      });
      
      // Update the prompts form
      this.promptsForm.patchValue({
        systemPrompt: this.systemPrompt,
        userPrompt: this.userPrompt
      }, { emitEvent: false });
    } else {
      // Use the edited prompts
      this.systemPrompt = currentSystemPrompt || '';
      this.userPrompt = currentUserPrompt || '';
    }
    
    // Create combined prompt
    this.combinedPrompt = `System Prompt:\n${this.systemPrompt}\n\nUser Prompt:\n${this.userPrompt}`;
  }

  async copyPrompt(type: 'system' | 'user' | 'combined') {
    try {
      const textToCopy = type === 'combined' ? 
        this.combinedPrompt : 
        type === 'system' ? this.systemPrompt : this.userPrompt;
        
      await navigator.clipboard.writeText(textToCopy);
      this.copySuccess[type] = true;
      setTimeout(() => this.copySuccess[type] = false, 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  }

  get prettyJsonResponse(): string {
    try {
      const response = this.form.get('aiResponse')?.value;
      if (!response) return '';
      
      // If it's a section, only show that section's data
      if (this.promptType === 'section' && this.initialData) {
        const sectionData = {
          id: this.initialData.id,
          title: this.initialData.title,
          type: this.initialData.type,
          content: this.initialData.content,
          passage: this.initialData.passage,
          meaning: this.initialData.meaning,
          commentary: this.initialData.commentary,
          // Add other section-specific fields here
        };
        return JSON.stringify(sectionData, null, 2);
      }
      
      // For parts, show the full response
      return JSON.stringify(
        typeof response === 'string' ? JSON.parse(response) : response, 
        null, 
        2
      );
    } catch (e) {
      this.isEditing = false;
      console.error('Error getting pretty JSON response:', e);
      this.toastr.show('Failed to get pretty JSON response. Please try again.', 'Error', 'bg-danger text-white');
      return this.form.get('aiResponse')?.value || '';
    }
  }

  async parseAndApplyResponse() {
    try {
      this.isEditing = false;
      this.isGeneratingResponse = true;

      // Use the current prompts from the form
      const systemPrompt = this.promptsForm.get('systemPrompt')?.value;
      const userPrompt = this.promptsForm.get('userPrompt')?.value;

      if (this.promptType === 'section') {
        const response = await this.genAiService.generateSection({
          title: this.form.get('title')?.value,
          description: this.form.get('description')?.value,
          context: this.form.get('context')?.value,
          language: this.metadata?.language || 'en',
          systemPrompt: systemPrompt,
          userPrompt: userPrompt,

        });

        if (response && this.initialData?.id) {
          const updatedSection = {
            ... JSON.parse(response),
            id: this.initialData.id
          };

          // Update the form
          this.form.patchValue({
            title: updatedSection.title,
            description: updatedSection.description,
            aiResponse: updatedSection
          });

          this.parsedResponse = updatedSection;

          // Emit the section update
          this.generate.emit(updatedSection);
          this.toastr.show('Section generated successfully', 'Success',  'bg-success text-white' );
        }
      } else {
        const response = await this.genAiService.generatePart({
          title: this.form.get('title')?.value,
          description: this.form.get('description')?.value,
          context: this.form.get('context')?.value,
          language: this.metadata?.language || 'en',
          sectionCount: this.metadata?.partsMetadata[this.initialData?.id]?.sectionCount || 1,
          systemPrompt: systemPrompt,
          userPrompt: userPrompt
        });

        if (response) {
          const responseObj = typeof response === 'string' ? JSON.parse(response) : response;
          this.form.patchValue({
            title: responseObj.title,
            description: responseObj.description,
            aiResponse: responseObj
          });
          this.parsedResponse = responseObj;
          this.generate.emit(responseObj);
          this.toastr.show('Part generated successfully', 'Success',  'bg-success text-white' );
        }
      }
    } catch (error) {
      console.error('Error generating response:', error);
      this.toastr.show('Failed to generate response. Please try again.', 'Error',  'bg-danger text-white' );
    } finally {
      this.isGeneratingResponse = false;
    }
  }

  toggleEditMode() {
    if (this.isEditing) {
      // If we're currently editing, this is a save action
      this.saveEdits();
      this.isEditing = false;
      return;
    } else {
      // Entering edit mode - set the current value with pretty printing
      const currentValue = this.form.get('aiResponse')?.value;
      
      // Pretty print the JSON with proper indentation
      const formattedJson = JSON.stringify(
        typeof currentValue === 'string' ? JSON.parse(currentValue) : currentValue, 
        null, 
        2
      );
      
      this.jsonEditControl.setValue(formattedJson);
    }
    this.isEditing = !this.isEditing;
  }

  updateJsonResponse(value: string) {
    try {
      // Validate JSON as user types
      const parsedJson = JSON.parse(value);
      this.isValidJson = true;
      
      if (this.promptType === 'section' && this.initialData?.id) {
        // For sections, preserve the ID when updating
        const updatedValue = {
          ...parsedJson,
          id: this.initialData.id
        };
        this.form.get('aiResponse')?.setValue(updatedValue);
      } else {
        this.form.get('aiResponse')?.setValue(parsedJson);  // Store as object, not string
      }
    } catch (e) {
      this.isValidJson = false;
    }
  }

  saveEdits() {
    try {
      // Get the current value from the edit control
      const editedValue = this.jsonEditControl.value;
      if (!editedValue) {
        throw new Error('No content to save');
      }

      // Parse the JSON
      const parsedValue = JSON.parse(editedValue);
      
      if (this.promptType === 'section' && this.initialData?.id) {
        // For sections, maintain the ID and parent part relationship
        const updatedSection = {
          ...parsedValue,
          id: this.initialData.id
        };
        this.parsedResponse = updatedSection;
        // Update the form
        this.form.patchValue({
          title: updatedSection.title || this.form.get('title')?.value,
          description: updatedSection.description || this.form.get('description')?.value,
          aiResponse: updatedSection
        });

        // Emit the section update
        this.generate.emit(updatedSection);
        this.toastr.show('Section updated successfully', 'Success', 'bg-success text-white');
      } else {
        // Existing part update logic
        this.form.patchValue({
          title: parsedValue.title || this.form.get('title')?.value,
          description: parsedValue.description || this.form.get('description')?.value,
          aiResponse: parsedValue
        });
        this.parsedResponse = parsedValue;
        this.generate.emit(parsedValue);
        this.toastr.show('Part updated successfully', 'Success', 'bg-success text-white');
      }
      
      this.isValidJson = true;
      this.isEditing = false;  // Exit edit mode after successful save
    } catch (e) {
      this.isValidJson = false;
      this.toastr.show('Failed to save changes. Please check the JSON format.', 'Error', 'bg-danger text-white');
      console.error('Invalid JSON:', e);
    }
  }

  // Add a method to handle the save button click
  onSaveClick() {
    if (this.isEditing) {
      this.saveEdits();
    }
  }

  // Add method to reset prompts to original values
  resetPrompts() {
    this.loadPrompts();
  }
} 