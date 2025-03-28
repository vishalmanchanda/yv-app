
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { debounceTime, takeUntil, filter } from 'rxjs/operators';

import { ContentBuilderService } from '../../../../core/services/content-builder.service';
import { fromEvent } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { JsonViewComponent } from '../json-view/json-view.component';
import { AIFormComponent } from '../../../../shared/components/ai-form/ai-form.component';
import { GenAIService } from '../../../../../../../core/services/gen-ai.service';





import { MarkdownModule } from 'ngx-markdown';

import { PromptTabsComponent } from "../../../content-creation/components/prompt-tabs/prompt-tabs.component";
import { ContentCreationService } from '../../../content-creation/services/content-creation.service';

import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';


import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { ContentMetadata, Part, Section } from '../../../../../../../core/models/content.models';
import { SectionViewComponent } from '../../../../../../content-renderer/components/section-view/section-view.component';
import { SettingsService } from '../../../../../../content-renderer/services/settings.service';
import { environment } from '../../../../../../content-viewer/environments/environment';
import { ContentGenerationService } from '../../../../core/services/content-generation.service';
import { ToastService } from '../../../../core/services/toast.service';


declare let bootstrap: any;

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    JsonViewComponent,
    MarkdownModule,
    SectionViewComponent,
    PromptTabsComponent
],
  selector: 'app-section-editor',
  templateUrl: './section-editor.component.html',
  styles: [`
    .section-editor {
      height: 85vh;

    }

    .section-sidebar {
      width: 280px;
      flex-shrink: 0;
    }

    .section-main {
      flex: 1;
      min-width: 0; // Prevents flex item from overflowing
    }

    .editor-header {
      flex-shrink: 0;

    }

    .editor-content {
      height: 0; // Required for proper scrolling
      min-height: 0; // Required for Firefox
      
      .editor-form {
        max-width: 800px;
        margin: 0 auto;
      }
    }

    .editor-footer {
      flex-shrink: 0;
      box-shadow: 0 -2px 10px rgba(0,0,0,.05);
    }

 
    .section-list {
      font-size: 1rem;

      // hide the scrollbar
      overflow-y: hidden;
      scrollbar-width: none;
      -ms-overflow-style: none;
      &::-webkit-scrollbar {
        width: 0;
        background: transparent;
      }
      // text overflow wrap to new line
      
    }

    .section-title {
      width: 180px;
      overflow: hidden;
      text-wrap: balance;

    }

    // Navigation tabs styling
    .nav-tabs {
      border-bottom: none;
      
      .nav-link {
        border: none;
        color: var(--bs-gray-600);
        padding: 0.5rem 1rem;
        cursor: pointer;
        
        &:hover {
          color: var(--bs-primary);

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

    // Form styling
    .form-control, .form-select {
      border-color: var(--bs-gray-300);
      
      &:focus {
        border-color: var(--bs-primary);
        box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.1);
      }
    }

    // List group styling
    .list-group-item {
      border-radius: 6px;
      margin-bottom: 0.5rem;
      border: 1px solid var(--bs-gray-200);
      
      &:hover {
        background-color: var(--bs-gray-100);
        color: #495057;
      }
      
      &.active {
        background-color: var(--bs-primary-bg-subtle);
        border-color: var(--bs-primary-border-subtle);
        color: var(--bs-primary);
      }
    }

    // Scrollbar styling
    .custom-scrollbar {
      scrollbar-width: thin;
      scrollbar-color: var(--bs-gray-400) transparent;
      
      &::-webkit-scrollbar {
        width: 6px;
      }
      
      &::-webkit-scrollbar-track {
        background: transparent;
      }
      
      &::-webkit-scrollbar-thumb {
        background-color: var(--bs-gray-400);
        border-radius: 3px;
      }
    }
  `]
})
export class SectionEditorComponent implements OnChanges, OnDestroy, OnInit {
  @Input() content: ContentMetadata | null = null;
  @Input() part: Part | null = null;
  @Input() partId: number | null = null;
  @Input() saving = false;
  @Input() error: string | null = null;
  @Output() sectionUpdate = new EventEmitter<{
    partId: number;
    sectionId: number;
    changes: Partial<Section>;
  }>();
  @Output() sectionSelected = new EventEmitter<Section>();

  sectionForm: FormGroup | null = null;
  selectedSection: Section | null = null;
  private destroy$ = new Subject<void>();
  private updateInProgress = false;
  canUndo$: Observable<boolean>;
  canRedo$: Observable<boolean>;
  currentView: 'preview' | 'form' | 'prompt' | 'rag' = 'form';
  formattedCommentary: string | null = null;
  context: string | null = null;
  ragQuestion = '';
  ragResponse: any = null;
  isLoading = false;
  isSourceExpanded: boolean[] = [];
  researchType: 'local' | 'web' = 'local';

  constructor(private fb: FormBuilder, 
    private contentService: ContentBuilderService, 
    private contentCreatorService: ContentCreationService,
    private contentGenerationService: ContentGenerationService,
    private genAiService: GenAIService, 
    private settingsService: SettingsService,
    private toastService: ToastService,
    private http: HttpClient
  ) {
    this.canUndo$ = this.contentService.canUndo$;
    this.canRedo$ = this.contentService.canRedo$;

    this.initForm();

    // Setup undo/redo keyboard shortcuts
    this.setupKeyboardShortcuts();

    // Auto-save on form changes
    if (this.sectionForm) {
      this.sectionForm.valueChanges.pipe(
        takeUntil(this.destroy$),
        debounceTime(1000),
        filter(() => !this.saving && this.selectedSection !== null)
    ).subscribe(changes => {
      if (this.selectedSection && this.partId) {
        this.sectionUpdate.emit({
          partId: this.partId,
          sectionId: parseInt(this.selectedSection.id),
          changes
        });
        }
      });
    }

    // Preserve the current theme
    const currentTheme = document.documentElement.dataset['theme'];
    console.log('Current Theme on Init:', currentTheme);
    this.settingsService.getThemePreferences().subscribe(prefs => {
      if (currentTheme) {
        document.documentElement.dataset['theme'] = currentTheme;
        prefs.theme = currentTheme;
        console.log('Theme Preserved:', currentTheme);
      }
    });
  }

  private initForm() {
    this.sectionForm = this.fb.group({
      title: [''],
      type: ['default'],
      passage: [''],
      meaning: [''],
      commentary: [''],
      content: [''],
      tags: [[]]
    });
    this.formattedCommentary = null;
    // this.settingsService.getPreferences().subscribe(prefs => {
    //   // this.applyPreferences(prefs);
    //   document.documentElement.dataset['theme'] = prefs.theme;
    // });
  }

  private setupKeyboardShortcuts() {
    fromEvent<KeyboardEvent>(document, 'keydown')
      .pipe(takeUntil(this.destroy$))
      .subscribe(event => {
        if (event.ctrlKey && event.key === 'z') {
          event.preventDefault();
          if (event.shiftKey) {
            this.onRedo();
          } else {
            this.onUndo();
          }
        }
      });
  }

  async addSection() {
    if (this.content && this.partId) {
      this.initForm();
      await this.contentService.addSection(this.content.id, this.partId);
    }
  }

  async onJsonChange(updatedJson: any) {
    console.log('JSON changed:', updatedJson);
    
    if (!this.content || !this.part) {
      console.warn('Missing content or part for JSON update');
      return;
    }

    try {
      this.selectedSection = updatedJson;
      
      // Create a new array with the updated section
      const updatedSections = this.part.sections.map(section => 
        section.id === updatedJson.id ? { ...updatedJson } : section
      );

      // Update the part with new sections array
      this.part = {
        ...this.part,
        sections: updatedSections
      };

      // Save the updated part
      await this.contentService.updatePart(
        this.content.id,
        this.part.id,
        this.part
      );

      // Update form to reflect changes
      if (this.sectionForm) {
        this.sectionForm.patchValue(updatedJson, { emitEvent: false });
      }
    } catch (error) {
      console.error('Error saving JSON changes:', error);
    }
  }

  selectSection(section: Section) {
    if (!section) return;

    // Create a new reference to prevent mutations
    this.selectedSection = { ...section };

    // Update form with the new section data
    if (this.sectionForm) {
      this.sectionForm.patchValue(this.selectedSection, { emitEvent: false });
    }
  }

  deleteSection(id: string) {
    if (this.content && this.partId) {
      this.contentService.deleteSection(this.content?.id, 
        this.partId, id);
    }
  }

  onUndo() {
    // Implementation for undo
  }

  onRedo() {
    // Implementation for redo
  }

  onManualSave() {
    if (this.selectedSection && this.partId && this.sectionForm) {
      this.sectionUpdate.emit({
        partId: this.partId,
        sectionId: parseInt(this.selectedSection.id),
            changes: this.sectionForm.value
      });
    }
  }

  removeTag(tag: string) {
    const tags = this.sectionForm?.get('tags')?.value || [];
    this.sectionForm?.patchValue({
      tags: tags.filter((t: string) => t !== tag)
    });
  }

  addTag(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;
    const value = input.value.trim();
    
    if (value) {
      const tags = this.sectionForm?.get('tags')?.value || [];
      if (!tags.includes(value)) {
        this.sectionForm?.patchValue({
          tags: [...tags, value]
        });
      }
      input.value = '';
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['part'] && this.part) {
      if (this.selectedSection && this.sectionForm) {
        const updatedSection = this.part.sections?.find(s => s.id === this.selectedSection?.id);
        if (updatedSection) {
          this.selectSection(updatedSection);
        }
      } else if (this.part.sections && this.part.sections.length > 0 && !this.selectedSection) {
        this.selectSection(this.part.sections[0]);
      }
    }
  }

  switchToForm() {
    this.currentView = 'form';
    if (this.selectedSection && this.sectionForm) {
      this.sectionForm.patchValue(this.selectedSection, { emitEvent: false });
    }
  }

  switchToPreview() {
    this.currentView = 'preview';
   
  }

  async saveFormChanges() {
   this.onSectionUpdate(this.sectionForm?.value);

   let sectionInPart = this.part?.sections.find(s => s.id === this.selectedSection?.id);
   if (sectionInPart) {
    sectionInPart = this.selectedSection as Section;
   }
   if (this.content && this.part) {
    this.part.sections = this.part.sections.map(s => s.id === this.selectedSection?.id ? this.selectedSection : s);
    await this.contentService.updatePart(this.content.id, this.part.id, this.part);
   }
  }

  onSectionUpdate(changes: any) {
    if (this.selectedSection && this.partId) {
      this.sectionUpdate.emit({
        partId: this.partId,
        sectionId: parseInt(this.selectedSection.id),
        changes: {
          ...changes,
          id: this.selectedSection.id // Ensure ID is preserved
        }
      });
    }
  }


  async generateSection() {
    try {
      this.saving = true;

      if (this.selectedSection && this.sectionForm && this.part) {
        const response = await this.contentGenerationService.generateSection(
          {content_metadata: this.content as ContentMetadata,
          part_number: this.part.id,
          section_number: parseInt(this.selectedSection.id),
          section_instructions: {},
          model: environment.LLM_MODEL,
          research_type: 'web',
          research_results: ''
        });

        // Clean and parse the response
        let generatedSection;
        try {
            generatedSection = response;
            console.log('Generated section:', generatedSection);
          // Ensure we have a valid section object
          if (!generatedSection || !generatedSection.id) {
            throw new Error('Invalid section data received');
          }

          // Update the selected section with the generated data
          this.selectedSection = generatedSection;

          // Update the form with the new section data
          this.sectionForm.patchValue(this.selectedSection as Section, { emitEvent: true });

          
        } catch (parseError) {
          console.error('Error parsing section data:', parseError);
          console.log('Raw response:', response);
          throw new Error('Failed to parse generated section data');
        }
      }
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Failed to generate section';
      this.toastService.show('Error', this.error);
    } finally {
      this.saving = false;
    }
  }

  switchView(view: 'form' | 'preview' | 'prompt') {
    this.currentView = view;
    if (view === 'form' && this.selectedSection && this.sectionForm) {
      this.sectionForm.patchValue(this.selectedSection, { emitEvent: false });
    }
  }

  switchToPrompt() {
    this.currentView = 'prompt';
  }

  async formatCommentary() {
    //call the gen ai service to format the commentary
    if (this.selectedSection?.commentary) {
      this.formattedCommentary = await this.genAiService?.formatExplanation(this.selectedSection?.commentary);
    } else {
      this.formattedCommentary = "No commentary to format";
    }
  }

  useFormattedCommentary() {
    if (this.formattedCommentary) {
      this.sectionForm?.patchValue({ commentary: this.formattedCommentary });
    }
  }

  onUserPromptChange(prompt: string) {
    console.log('User prompt changed:', prompt);
    
  }

  onSystemPromptChange(prompt: string) {
    console.log('System prompt changed:', prompt);
  }

  ngOnInit() {
    // Initialize any existing Bootstrap components
    // This ensures Bootstrap's JavaScript is properly initialized
    document.querySelectorAll('[data-bs-toggle="collapse"]').forEach(button => {
      new bootstrap.Collapse(button, {
        toggle: false
      });
    });
  }

  switchToRag() {
    this.currentView = 'rag';
  }

  async askRag() {
    if (!this.ragQuestion) return;
    
    this.isLoading = true;
    try {
      let response;      
      if (this.researchType === 'local') {
        response = await this.http.post(environment.apiUrl + '/rag/rag-chat', {
          question: this.ragQuestion,
          stream: false,
          collection_name: 'rag_docs_v2'
        }).toPromise() as any;

        response = {
          answer: response?.answer,
          source_documents: response?.source_documents?.map((source: any) => ({
            content: source.content,
            metadata: {
              verseNum: source.metadata.verseNum,
              chapter: source.metadata.chapter,
              verse: source.metadata.verse
            }
          }))
        };
      
      } else {
        response = await this.http.post(environment.apiUrl + '/web-researcher/research', {
          query: this.ragQuestion,
          model: environment.LLM_MODEL,
          max_results: 5

        }).toPromise() as any;

        response = {
          answer: response?.content,
          source_documents:[]
        };
      }
      this.ragResponse = response;
      this.isSourceExpanded = new Array(this.ragResponse.source_documents.length).fill(false);
    } catch (error) {
      console.error('Research error:', error);
      this.error = `Failed to get ${this.researchType === 'local' ? 'local' : 'web'} research response`;
    } finally {
      this.isLoading = false;
    }
  }

  useRagAnswer() {
    if (this.ragResponse && this.sectionForm) {
      this.sectionForm.patchValue({
        content: this.ragResponse.answer
      });
      this.switchToForm(); // Switch back to form view
    }
  }

  toggleSource(index: number) {
    this.isSourceExpanded[index] = !this.isSourceExpanded[index];
  }
} 
