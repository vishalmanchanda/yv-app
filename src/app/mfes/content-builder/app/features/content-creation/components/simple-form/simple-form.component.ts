import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

import { FormsModule } from '@angular/forms';
import { ContentCategory } from '../../../../../../../core/models/content.models';
import { ContentType } from '../../../../../../../core/models/content.models';

@Component({
  selector: 'app-simple-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './simple-form.component.html',
  styleUrls: ['./simple-form.component.scss']
})
export class SimpleFormComponent {
  @Output() formDataChange = new EventEmitter<any>();

  form: FormGroup;
  previewImage: string | null = null;
  
  contentTypes: ContentType[] = ['book', 'course', 'study', 'quiz', 'article', 'video'];
  categories: ContentCategory[] = ['spiritual', 'technical', 'study', 'other'];
  languages = ['en', 'fr', 'es', 'hi'];

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      type: ['book', Validators.required],
      category: ['spiritual', Validators.required],
      language: ['en', Validators.required],
      keywords: [''],
      coverImage: ['']
    });

    this.form.valueChanges.subscribe(value => {
      this.formDataChange.emit(value);
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewImage = e.target.result;
        this.form.patchValue({ coverImage: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  }
} 