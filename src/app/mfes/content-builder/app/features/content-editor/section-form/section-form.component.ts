import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from "@angular/core";
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms";
import { Section } from '../../../../../../core/models/content.models';
import { JsonViewComponent } from "../components/json-view/json-view.component";
import { debounceTime } from "rxjs";
import { GenAIService } from '../../../../../../core/services/gen-ai.service';

@Component({
  selector: 'app-section-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, JsonViewComponent],
  template: `
    <div class="section-form">
      <form [formGroup]="sectionForm" (ngSubmit)="onSubmit()">
        <!-- Title -->
        <div class="form-group mb-3">
          <label for="title">Title</label>
          <input type="text" 
                 class="form-control" 
                 id="title"
                 formControlName="title"
                 [class.is-invalid]="isFieldInvalid('title')">
          <div class="invalid-feedback" *ngIf="isFieldInvalid('title')">
            Title is required
          </div>
        </div>

        <!-- Type -->
        <div class="form-group mb-3">
          <label for="type">Type</label>
          <select class="form-select" 
                  id="type"
                  formControlName="type"
                  [class.is-invalid]="isFieldInvalid('type')">
            <option value="">Select type...</option>
            <option value="default">Default</option>
            <option value="code">Code</option>
            <option value="markdown">Markdown</option>
            <option value="html">HTML</option>
          </select>
          <div class="invalid-feedback" *ngIf="isFieldInvalid('type')">
            Type is required
          </div>
        </div>

        <!-- Content -->
        <div class="form-group mb-3">
          <label for="content">Content</label>
          <textarea class="form-control" 
                    id="content"
                    formControlName="content"
                    rows="10"
                    [class.is-invalid]="isFieldInvalid('content')"></textarea>
          <div class="invalid-feedback" *ngIf="isFieldInvalid('content')">
            Content must be at least 10 characters long
          </div>
        </div>

        <!-- Optional Fields -->
        <div class="accordion mb-3" id="optionalFields">
          <div class="accordion-item">
            <h2 class="accordion-header">
              <button class="accordion-button collapsed" 
                      type="button" 
                      data-bs-toggle="collapse"
                      data-bs-target="#additionalFields">
                Additional Fields
              </button>
            </h2>
            <div id="additionalFields" 
                 class="accordion-collapse collapse">
              <div class="accordion-body">
                <!-- Passage -->
                <div class="form-group mb-3">
                  <label for="passage">Passage</label>
                  <textarea class="form-control" 
                           id="passage"
                           formControlName="passage"
                           rows="3"></textarea>
                </div>

                <!-- Meaning -->
                <div class="form-group mb-3">
                  <label for="meaning">Meaning</label>
                  <textarea class="form-control" 
                           id="meaning"
                           formControlName="meaning"
                           rows="3"></textarea>
                </div>

                <!-- Commentary -->
                <div class="card">
                  <div class="card-header">
                    <button type="button" class="btn btn-primary" (click)="formatCommentary()">Format Commentary</button>
                  </div>
                  <div class="card-body">
                    <div class="form-group mb-3">
                      <label for="commentary">Commentary</label>
                  <textarea class="form-control" 
                           id="commentary"
                           formControlName="commentary"
                           rows="3"></textarea>
                    </div>
                  </div>
                </div>

                <!-- Tags -->
                <div class="form-group">
                  <label for="tags">Tags (comma separated)</label>
                  <input type="text" 
                         class="form-control" 
                         id="tags"
                         formControlName="tags">
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="d-flex justify-content-between align-items-center">
          <div class="form-text" *ngIf="lastSaved">
            Last saved: {{ lastSaved | date:'medium' }}
          </div>
          <div class="btn-group">
            <button type="button" 
                    class="btn btn-outline-secondary"
                    (click)="toggleJsonView()">
              {{ showJson ? 'Hide' : 'Show' }} JSON
            </button>
            <button type="submit" 
                    class="btn btn-primary"
                    [disabled]="!sectionForm.valid || saving">
              {{ saving ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </div>
      </form>

      <!-- JSON View -->
      <div class="json-view mt-4" *ngIf="showJson">
        <app-json-view 
          [data]="sectionForm.value"
          (dataChange)="onJsonUpdate($event)">
        </app-json-view>
      </div>
    </div>
  `
})
export class SectionFormComponent implements OnInit, OnChanges {
  @Input() section?: Section;
  @Input() saving = false;
  @Input() lastSaved?: Date;
  @Output() sectionChange = new EventEmitter<Section>();

  sectionForm: FormGroup = new FormGroup({});
  showJson = false;

  constructor(private fb: FormBuilder, private genAiService: GenAIService) {
    this.initForm();
  }
  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['section'] && this.section) {
      console.log('Section changed:', this.section);
      this.sectionForm.patchValue({
        ...this.section,
        tags: Array.isArray(this.section.tags) ? 
          this.section.tags.join(', ') : 
          this.section.tags
      }, { emitEvent: false });
    }
  }

  private initForm() {
    this.sectionForm = this.fb.group({
      title: ['', Validators.required],
      type: ['', Validators.required],
      content: [''],
      passage: [''],
      meaning: [''],
      commentary: [''],
      tags: ['']
    });

    this.sectionForm.valueChanges
      .pipe(debounceTime(500))
      .subscribe(value => {
        if (this.sectionForm.valid) {
          this.sectionChange.emit(this.prepareFormData(value));
        }
      });
  }

  private prepareFormData(formValue: any): Section {
    return {
      ...this.section,
      ...formValue,
      id: this.section?.id || crypto.randomUUID(),
      tags: formValue.tags ? 
        (typeof formValue.tags === 'string' ? 
          formValue.tags.split(',').map((t: string) => t.trim()) : 
          formValue.tags
        ) : [],
      subsections: this.section?.subsections || []
    };
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.sectionForm.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }

  toggleJsonView() {
    this.showJson = !this.showJson;
  }

  onJsonUpdate(data: any) {
    this.sectionForm.patchValue(data, { emitEvent: false });
  }

  onSubmit() {
    if (this.sectionForm.valid) {
      const updatedSection = this.prepareFormData(this.sectionForm.value);
      console.log('Submitting updated section:', updatedSection);
      this.sectionChange.emit(updatedSection);
    }
  }

  async formatCommentary() {
    //call the gen ai service to format the commentary
    const formattedCommentary = await this.genAiService.formatExplanation(this.sectionForm.value);
    this.sectionForm.patchValue({ commentary: formattedCommentary });
  }
}
