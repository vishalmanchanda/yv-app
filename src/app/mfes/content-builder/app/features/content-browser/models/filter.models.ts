export interface ContentFilters {
  searchTerm: string;
  sortBy: 'title' | 'updatedAt' | 'createdAt';
  sortDirection: 'asc' | 'desc';
  dateRange?: {
    start: Date | null;
    end: Date | null;
  };
} 