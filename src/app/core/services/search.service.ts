import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'page' | 'document' | 'user' | 'setting';
  icon?: string;
  url: string;
}

export interface SearchHistory {
  query: string;
  timestamp: number;
  resultCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private readonly HISTORY_KEY = 'search_history';
  private readonly MAX_HISTORY = 10;
  private readonly MAX_SUGGESTIONS = 5;

  private searchSubject = new BehaviorSubject<string>('');
  private historySubject = new BehaviorSubject<SearchHistory[]>(this.loadHistory());
  
  search$ = this.searchSubject.asObservable();
  history$ = this.historySubject.asObservable();

  // Mock data for demonstration
  private mockData: SearchResult[] = [
    {
      id: '1',
      title: 'Dashboard',
      description: 'Main dashboard page',
      type: 'page',
      icon: 'bi-speedometer2',
      url: '/dashboard'
    },
    {
      id: '2',
      title: 'User Settings',
      description: 'User preferences and settings',
      type: 'setting',
      icon: 'bi-gear',
      url: '/settings'
    },
    {
      id: '3',
      title: 'Documentation',
      description: 'Application documentation',
      type: 'document',
      icon: 'bi-file-text',
      url: '/docs'
    }
  ];

  constructor() {
    // Initialize search history
    this.loadHistory();
  }

  search(query: string): Observable<SearchResult[]> {
    this.searchSubject.next(query);
    
    if (!query.trim()) {
      return of([]);
    }

    // Simulate API search
    const results = this.mockData.filter(item =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase())
    );

    // Save to history
    this.addToHistory(query, results.length);

    return of(results).pipe(
      debounceTime(300)
    );
  }

  getSuggestions(query: string): Observable<string[]> {
    const history = this.historySubject.value;
    return of(
      history
        .filter(h => h.query.toLowerCase().startsWith(query.toLowerCase()))
        .sort((a, b) => b.timestamp - a.timestamp)
        .map(h => h.query)
        .slice(0, this.MAX_SUGGESTIONS)
    );
  }

  clearHistory(): void {
    localStorage.removeItem(this.HISTORY_KEY);
    this.historySubject.next([]);
  }

  private loadHistory(): SearchHistory[] {
    try {
      const stored = localStorage.getItem(this.HISTORY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading search history:', error);
      return [];
    }
  }

  private addToHistory(query: string, resultCount: number): void {
    const history = this.historySubject.value;
    const newEntry: SearchHistory = {
      query,
      timestamp: Date.now(),
      resultCount
    };

    const updated = [newEntry, ...history]
      .filter((item, index, self) => 
        index === self.findIndex(t => t.query === item.query)
      )
      .slice(0, this.MAX_HISTORY);

    localStorage.setItem(this.HISTORY_KEY, JSON.stringify(updated));
    this.historySubject.next(updated);
  }
} 