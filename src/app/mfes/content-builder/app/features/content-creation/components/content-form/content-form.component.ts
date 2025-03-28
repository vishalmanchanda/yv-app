import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, FormsModule, ReactiveFormsModule   } from '@angular/forms';

import { PromptTabsComponent } from '../prompt-tabs/prompt-tabs.component';
import { ContentCategory } from '../../../../../../../core/models/content.models';
import { ContentType } from '../../../../../../../core/models/content.models';


@Component({
  selector: 'app-content-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PromptTabsComponent],
  templateUrl: './content-form.component.html'
})
export class ContentFormComponent {
  @Output() formDataChange = new EventEmitter<any>();

  contentForm: FormGroup;
  
  contentTypes: ContentType[] = ['book', 'course', 'study', 'quiz', 'article', 'video'];
  categories: ContentCategory[] = ['spiritual', 'technical', 'study', 'other'];
  languages = ['en', 'fr', 'es', 'hi'];

  constructor(private fb: FormBuilder) {
    this.contentForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      type: ['book', Validators.required],
      category: ['spiritual', Validators.required],
      categoryKey: [''],
      language: ['en', Validators.required],
      keywords: [''],
      authors: this.fb.array([])
    });

    this.contentForm.valueChanges.subscribe(value => {
      this.formDataChange.emit(value);
    });

    // Auto-generate categoryKey from category
    this.contentForm.get('category')?.valueChanges.subscribe(category => {
      this.contentForm.patchValue({
        categoryKey: `${category}_${Date.now()}`
      }, { emitEvent: false });
    });
  }

  get authorsArray() {
    return this.contentForm.get('authors') as FormArray;
  }

  addAuthor() {
    const author = this.fb.group({
      id: [this.generateId()],
      name: ['', Validators.required],
      image: [''],
      bio: [''],
      website: ['']
    });

    this.authorsArray.push(author);
  }

  removeAuthor(index: number) {
    this.authorsArray.removeAt(index);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
} 