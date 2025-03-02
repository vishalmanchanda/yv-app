import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { SearchService, SearchResult } from '../../../core/services/search.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="search-container" [class.active]="isActive">
      <div class="search-input-wrapper">
        <i class="bi bi-search"></i>
        <input
          type="text"
          class="search-input"
          [(ngModel)]="searchQuery"
          (ngModelChange)="onSearchChange($event)"
          (focus)="isActive = true"
          (blur)="onBlur()"
          placeholder="Search..."
        >
        @if (searchQuery) {
          <button class="clear-button" (click)="clearSearch()">
            <i class="bi bi-x"></i>
          </button>
        }
      </div>

      @if (isActive && (results.length > 0 || suggestions.length > 0)) {
        <div class="search-results">
          @if (suggestions.length > 0 && !results.length) {
            <div class="suggestions">
              <h6>Suggestions</h6>
              @for (suggestion of suggestions; track suggestion) {
                <div class="suggestion-item" (click)="selectSuggestion(suggestion)">
                  <i class="bi bi-clock-history"></i>
                  {{ suggestion }}
                </div>
              }
            </div>
          }

          @if (results.length > 0) {
            <div class="results">
              <h6>Results</h6>
              @for (result of results; track result.id) {
                <div class="result-item" (click)="selectResult(result)">
                  <i [class]="'bi ' + (result.icon || 'bi-arrow-right')"></i>
                  <div class="result-content">
                    <div class="result-title">{{ result.title }}</div>
                    <div class="result-description">{{ result.description }}</div>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .search-container {
      position: relative;
      width: 100%;
      max-width: 600px;
    }

    .search-input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .search-input {
      width: 100%;
      padding: 0.5rem 2.5rem;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      background: var(--bg-primary);
      color: var(--text-primary);
      font-size: 1rem;
    }

    .search-input:focus {
      outline: none;
      border-color: var(--bs-primary);
      box-shadow: 0 0 0 2px rgba(var(--bs-primary-rgb), 0.25);
    }

    .bi-search {
      position: absolute;
      left: 0.75rem;
      color: var(--text-secondary);
    }

    .clear-button {
      position: absolute;
      right: 0.75rem;
      background: none;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      padding: 0;
    }

    .search-results {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      margin-top: 0.5rem;
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      z-index: 1000;
    }

    h6 {
      margin: 0;
      padding: 0.75rem 1rem;
      color: var(--text-secondary);
      font-size: 0.875rem;
      border-bottom: 1px solid var(--border-color);
    }

    .suggestion-item,
    .result-item {
      padding: 0.75rem 1rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: var(--text-primary);
    }

    .suggestion-item:hover,
    .result-item:hover {
      background: var(--bg-secondary);
    }

    .result-content {
      flex: 1;
    }

    .result-title {
      font-weight: 500;
    }

    .result-description {
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin-top: 0.25rem;
    }

    .bi {
      font-size: 1rem;
      color: var(--text-secondary);
    }
  `]
})
export class SearchComponent implements OnInit, OnDestroy {
  searchQuery = '';
  isActive = false;
  results: SearchResult[] = [];
  suggestions: string[] = [];
  private searchSubject = new Subject<string>();
  private subscription = new Subscription();

  constructor(
    private searchService: SearchService,
    private router: Router
  ) {}

  ngOnInit() {
    this.subscription.add(
      this.searchSubject.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(query => this.searchService.search(query))
      ).subscribe(results => {
        this.results = results;
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  onSearchChange(query: string) {
    this.searchSubject.next(query);
    if (query) {
      this.searchService.getSuggestions(query).subscribe(
        suggestions => this.suggestions = suggestions
      );
    } else {
      this.suggestions = [];
      this.results = [];
    }
  }

  selectSuggestion(suggestion: string) {
    this.searchQuery = suggestion;
    this.onSearchChange(suggestion);
  }

  selectResult(result: SearchResult) {
    this.router.navigateByUrl(result.url);
    this.clearSearch();
  }

  clearSearch() {
    this.searchQuery = '';
    this.results = [];
    this.suggestions = [];
  }

  onBlur() {
    // Delay hiding results to allow for result selection
    setTimeout(() => {
      this.isActive = false;
    }, 200);
  }
} 