import { Component, OnInit } from '@angular/core';
import { SearchService, SearchResult } from '../../services/search.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { ContentService } from '../../services/content.service';
import { SearchStateService } from '../../services/search-state.service';

@Component({
  standalone: true,
  imports: [
    FormsModule,
    CommonModule
  ],
  selector: 'cr-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  searchQuery = '';
  searchResults: SearchResult[] = [];
  popularKeywords: string[] = [];
  recentSearches: string[] = [];
  isSearching = false;
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  paginatedResults: SearchResult[] = [];
  expandedVerseId: string | null = null;
  private searchSubject = new Subject<string>();
  isModalOpen = false;
  lastSearchState: {
    query: string;
    results: SearchResult[];
    currentPage: number;
    totalPages: number;
    paginatedResults: SearchResult[];
  } | null = null;

  constructor(
    private activeModal: NgbActiveModal,
    private searchService: SearchService,
    private contentService: ContentService,
    private router: Router,
    private searchStateService: SearchStateService
  ) {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      if (query) {
        this.performSearch();
      } else {
        this.clearSearchResults();
      }
    });
  }

  ngOnInit() {
    this.loadRecentSearches();
    this.loadPopularKeywords();
  }

  async loadPopularKeywords() {
    this.popularKeywords = await this.contentService.getPopularKeywords();
    console.log("popularKeywords", this.popularKeywords);

    if (this.popularKeywords && this.popularKeywords.length === 0) {
      this.popularKeywords = ["No", "popular", "keywords", "configured", "for", "this", "content"];
    }

    
  }

  onSearchInput(event?: KeyboardEvent) {
    if (!this.searchQuery.trim()) {
      this.clearSearchResults();
      return;
    }

    if (event?.key === 'Enter') {
      this.performSearch();
      return;
    }

    this.searchSubject.next(this.searchQuery);
  }

  async performSearch() {
    if (!this.searchQuery.trim()) return;
    
    this.isSearching = true;
    try {
      const results = await this.searchService.search(this.searchQuery);
      this.searchResults = results.map(result => ({
        ...result,
        highlightedText: this.highlightText(result.excerpt, this.searchQuery)
      }));
      
      this.totalPages = Math.ceil(this.searchResults.length / this.pageSize);
      this.currentPage = 1;
      this.updatePaginatedResults();
      
      if (this.searchResults.length > 0) {
        this.addToRecentSearches(this.searchQuery);
        this.saveSearchState();
      }
    } finally {
      this.isSearching = false;
    }
  }

  highlightText(text: string, query: string): string {
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  updatePaginatedResults() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedResults = this.searchResults.slice(startIndex, endIndex);
  }

  async navigateToResult(result: SearchResult) {
    const isSearchActive = await this.searchStateService.isSearchActive();
    if (!isSearchActive) {     
    await this.searchStateService.saveSearchState({
      query: this.searchQuery,
      results: this.searchResults,
      currentPage: this.currentPage,
      totalPages: this.totalPages,
      paginatedResults: this.paginatedResults,
      isActive: true
    });
    }
    console.log("isSearchActive", isSearchActive);
    await this.activeModal.close({
      partId: result.partId,
      sectionId: result.sectionId,
      searchQuery: this.searchQuery,
      returnToSearch: true
      
    });
    console.log("navigated to result "+result.partId + "." + result.sectionId);
  }

  loadRecentSearches() {
    const stored = localStorage.getItem('recent_searches');
    this.recentSearches = stored ? JSON.parse(stored) : [];
  }

  addToRecentSearches(keyword: string) {
    if (!this.recentSearches.includes(keyword)) {
      this.recentSearches.unshift(keyword);
      if (this.recentSearches.length > 5) {
        this.recentSearches.pop();
      }
      localStorage.setItem('recent_searches', JSON.stringify(this.recentSearches));
    }
  }

  searchKeyword(keyword: string) {
    this.searchQuery = keyword;
    this.performSearch();
  }

  async clearSearchQuery() {
    this.searchQuery = '';
    this.clearSearchResults();
    await this.searchStateService.clearSearchState();
  }

  clearSearchResults() {
    this.searchResults = [];
    this.paginatedResults = [];
    this.currentPage = 1;
    this.totalPages = 0;
  }
  
  dismiss() {
    this.activeModal.dismiss();
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  saveSearchState() {
    this.lastSearchState = {
      query: this.searchQuery,
      results: this.searchResults,
      currentPage: this.currentPage,
      totalPages: this.totalPages,
      paginatedResults: this.paginatedResults
    };
  }

  restoreSearchState(state: any) {
    this.searchQuery = state.query;
    this.searchResults = state.results;
    this.currentPage = state.currentPage;
    this.totalPages = state.totalPages;
    this.paginatedResults = state.paginatedResults;
  }
}