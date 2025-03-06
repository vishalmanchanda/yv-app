import { Injectable } from "@angular/core";
import { StorageService } from "./storage.service";
import { Commentary } from "../models/reader.interface";
import { HttpClient } from "@angular/common/http";
import { Author } from "../../../core/models/content.models";
import { ContentService } from "./content.service";


@Injectable({
  providedIn: 'root'
})
export class CommentaryService {
  

  authors: Author[] = [];

  constructor(private storageService: StorageService, private http: HttpClient,
    private contentService: ContentService
  ) {}

  async getAuthors(): Promise<Author[]> {
    const metadata = await this.storageService.getMetadata();
    if (metadata) {
      this.authors = metadata.authors;
    }
    return this.authors;
    // return [];
  }

  getAuthorById(authorId: string): Author | undefined {
    return this.authors.find(author => author.id === authorId);
  }

  async getVerseCommentaryByAuthor(contentId: string, partDotSection: string, authorId: string): Promise<string> {
    console.log('getVerseCommentaryByAuthor', contentId, partDotSection, authorId);
    
    let commentary = await this.storageService.getCommentary(authorId, contentId, partDotSection);

    console.log('commentary', commentary);
    if (!commentary || commentary === null) {
      await this.storeCommentary(authorId);

      commentary = await this.storageService.getCommentary(authorId, contentId, partDotSection);      

    }

    if (commentary) {
      return commentary.explanation;
    }
    
    return 'No commentary found for this verse.';
  }

  async storeCommentary(authorKey: string): Promise<void> {
    const commentary = await this.http.get<Commentary[]>(`assets/content/commentary/${authorKey}.json`).toPromise();
    if (commentary){
      await this.storageService.storeCommentary(authorKey, commentary);
      console.log('commentary stored');
      
    }
  }
}