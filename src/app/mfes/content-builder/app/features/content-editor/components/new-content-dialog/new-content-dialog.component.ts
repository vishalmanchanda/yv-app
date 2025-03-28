import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';



@Component({
  selector: 'app-new-content-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">Create New {{ data?.type | titlecase }}</h5>
      <button type="button" 
              class="btn-close" 
              (click)="activeModal.dismiss()" 
              aria-label="Close"></button>
    </div>

    <div class="modal-body">
      <form [formGroup]="form">
        <div class="mb-3">
          <label class="form-label" for="title">Title</label>
          <input type="text" 
                 class="form-control" 
                 id="title"
                 formControlName="title"
                 placeholder="Enter title">
          <div class="invalid-feedback" *ngIf="form.get('title')?.errors?.['required']">
            Title is required
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label" for="description">Description</label>
          <textarea class="form-control" 
                    id="description"
                      formControlName="description"
                    rows="3"
                    placeholder="Enter description"></textarea>
        </div>  

        <div class="mb-3">
          <label class="form-label" for="authors">Authors</label>
          <div class="input-group">
            <input type="text" 
                   class="form-control"
                   #authorInput
                   placeholder="Add author"
                   (keyup.enter)="addAuthor(authorInput)">
            <button class="btn btn-outline-secondary" 
                    type="button"
                    (click)="addAuthor(authorInput)">
              Add
            </button>
          </div>
          <div class="mt-2">
            <span *ngFor="let author of form.get('authors')?.value" 
                  class="badge bg-secondary me-1 mb-1">
              {{ author }}
              <i class="bi bi-x ms-1" 
                 role="button"
                 (click)="removeAuthor(author)"
                 (keyup.enter)="removeAuthor(author)"
                 tabindex="0"></i>
            </span>
          </div>
        </div>
      </form>
    </div>

    <div class="modal-footer">
      <button type="button" 
              class="btn btn-secondary" 
              (click)="activeModal.dismiss()">
        Cancel
      </button>
      <button type="button" 
              class="btn btn-primary" 
              [disabled]="!form.valid"
              (click)="save()">
        Create
      </button>
    </div>
  `,
  styles: [`
    .badge {
      i {
        cursor: pointer;
        &:hover {
          opacity: 0.8;
        }
      }
    }
  `]
})
export class NewContentDialogComponent {
  @Input() data: any;
  form: FormGroup;

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      authors: [[]]
    });
  }

  
  addAuthor(input: HTMLInputElement) {
    const value = input.value.trim();
    if (value) {
      const authors = this.form.get('authors')?.value || [];
      if (!authors.includes(value)) {
        this.form.patchValue({
          authors: [...authors, value]
        });
      }
      input.value = '';
    }
  }

  removeAuthor(author: string) {
    const authors = this.form.get('authors')?.value || [];
    this.form.patchValue({
      authors: authors.filter((a: string) => a !== author)
    });
  }

  save() {
    if (this.form.valid) {
      this.activeModal.close(this.form.value);
    }
  }
} 