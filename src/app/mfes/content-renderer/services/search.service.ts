import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';


export interface SearchResult {
  partId: number;
  partTitle: string;
  sectionId: string;
  sectionTitle: string;
  excerpt: string;
  highlightedText: string;
  matchCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  constructor(private storageService: StorageService) {}

  async search(query: string): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    const metadata = await this.storageService.getMetadata();
    
    if (!metadata) return results;
    console.log("metadata - ",metadata);

    for (const partMeta of metadata.partsMetadata) {

      const part = await this.storageService.getPart(partMeta.id);
      if (!part) continue;
      console.log("part - ",part);

      for (const section of part.sections) {

        const content = section.content?.toLowerCase() || '';
        const searchTerm = query.toLowerCase();
        
        const contentForSearch = content ? content : section.meaning?.toLowerCase() || '';
        if (contentForSearch.includes(searchTerm)) {
          const matchCount = (contentForSearch.match(new RegExp(searchTerm, 'gi')) || []).length;
          const startIndex = contentForSearch.indexOf(searchTerm);
          const excerpt = contentForSearch.substr(
            Math.max(0, startIndex - 50), 
            query.length + 100
          );

          results.push({
            partId: part.id,
            partTitle: part.title,
            sectionId: section.id,
            sectionTitle: section.title,
            excerpt: '...' + excerpt + '...',
            matchCount,
            highlightedText: excerpt
          });
        }
      }
    }
    console.log("results - ",results);
    return results.sort((a, b) => b.matchCount - a.matchCount);
  }
} 