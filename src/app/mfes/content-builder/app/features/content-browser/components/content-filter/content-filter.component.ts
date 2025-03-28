import { Component, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ContentFilters } from '../../models/filter.models';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-content-filter',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="content-filter p-3 bg-light rounded-3 mb-4">
      <form [formGroup]="filterForm" class="row g-3">
        <!-- Search -->
        <div class="col-12 col-md-4">
          <div class="input-group">
            <span class="input-group-text bg-white border-end-0">
              <i class="bi bi-search"></i>
            </span>
            <input type="text" 
                   class="form-control border-start-0" 
                   placeholder="Search content..."
                   formControlName="search">
          </div>
        </div>

        <!-- Type Filter -->
        <div class="col-12 col-md-3">
          <select class="form-select" formControlName="type">
            <option value="">All Types</option>
            <option value="book">Book</option>
            <option value="course">Course</option>
            <option value="article">Article</option>
          </select>
        </div>

        <!-- Status Filter -->
        <div class="col-12 col-md-3">
          <select class="form-select" formControlName="status">
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <!-- Sort -->
        <div class="col-12 col-md-2">
          <select class="form-select" formControlName="sort">
            <option value="updated">Last Updated</option>
            <option value="created">Created Date</option>
            <option value="title">Title</option>
          </select>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .input-group {
      .input-group-text {
        background-color: transparent;
      }
    }

    .form-select {
      &:focus {
        border-color: var(--bs-primary);
        box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
      }
    }
  `]
})
export class ContentFilterComponent implements OnDestroy {
  @Output() filterChange = new EventEmitter<ContentFilters>();
  
  filterForm: FormGroup;
  private destroy$ = new Subject<void>();

  constructor(private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      search: [''],
      type: [''],
      status: [''],
      sort: ['updated']
    });

    // Subscribe to form changes
    this.filterForm.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.emitFilterChange();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  clearSearch() {
    this.filterForm.patchValue({ search: '' });
  }

  toggleSortDirection() {
    const currentDirection = this.filterForm.get('sortDirection')?.value;
    this.filterForm.patchValue({
      sortDirection: currentDirection === 'desc' ? 'asc' : 'desc'
    });
  }

  getSortIcon(): string {
    return this.filterForm.get('sortDirection')?.value === 'desc' 
      ? 'arrow_downward' 
      : 'arrow_upward';
  }

  clearDateRange() {
    this.filterForm.patchValue({
      dateStart: null,
      dateEnd: null
    });
  }

  applyDateRange() {
    this.emitFilterChange();
  }

  hasDateFilter(): boolean {
    return !!(this.filterForm.get('dateStart')?.value || 
              this.filterForm.get('dateEnd')?.value);
  }

  hasActiveFilters(): boolean {
    return !!(this.filterForm.get('search')?.value || 
              this.hasDateFilter());
  }

  private emitFilterChange() {
    const formValue = this.filterForm.value;
    const filters: ContentFilters = {
      searchTerm: formValue.search,
      sortBy: formValue.sort,
      sortDirection: this.filterForm.get('sortDirection')?.value,
      dateRange: this.hasDateFilter() ? {
        start: formValue.dateStart,
        end: formValue.dateEnd
      } : undefined
    };
    this.filterChange.emit(filters);
  }
} 