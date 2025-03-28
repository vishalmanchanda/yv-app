import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../environments/environment';
import { Section } from '../../../../../core/models/content.models';
import { ContentMetadata } from '../../../../../core/models/content.models';



@Injectable({
  providedIn: 'root'
})
export class ContentGenerationService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  async generateMetadata(params: {
    id: string;
    topic: string;
    description?: string;
    context?: string;
    model?: string;
  }): Promise<any> {
    console.log('Sending request to:', `${this.apiUrl}/content-outline-generator/generate-outline`);
    console.log('With params:', params);
    const url = `${this.apiUrl}/content-outline-generator/generate-outline`;
    const response = await this.http.post(url, params).toPromise();
    console.log('Response received:', response);
    return response;
  }

  
 async generateSection(params: {
    content_metadata: ContentMetadata,
    part_number: number,
    section_number: number,
    section_instructions: object,
    model: string,
    research_type: string,
    research_results: string,
  }): Promise<Section> {
    console.log('Sending request to:', `${this.apiUrl}/section-generator/generate-section`);
    console.log('With params:', params);
    const url = `${this.apiUrl}/section-generator/generate-section`;
    const response = await this.http.post(url, params).toPromise();
    console.log('Response received:', response);
    return response as Section;
  }
} 