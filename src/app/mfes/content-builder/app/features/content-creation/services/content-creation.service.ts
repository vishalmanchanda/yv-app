import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ContentFormData } from '../models/content-form.model';
import { ContentMetadata, ContentType, Part, PartMetadata, Section } from '../../../../../../core/models/content.models';
import { IndexedDbService } from '../../../core/services/indexed-db.service';
import { PromptService, PromptType } from './prompt.service';
import { GenAIService } from '../../../../../../core/services/gen-ai.service';



@Injectable({
  providedIn: 'root'
})
export class ContentCreationService {
  constructor(
    private http: HttpClient,
    private indexedDb: IndexedDbService,
    private promptService: PromptService,
    private aiService: GenAIService
  ) {
    this.initDatabase();
  }

  private async initDatabase() {
    await this.indexedDb.initDatabase();
  }

  async createContent(formData: ContentFormData): Promise<ContentMetadata> {
    const content: ContentMetadata = {
      id: this.generateId(),
      title: formData.title,
      description: formData.description,
      status: 'draft',
      type: formData.type || 'article',
      categoryKey: formData.categoryKey || 'default',
      language: formData.language,
      coverImage: formData.coverImage || '',
      zipUrl: formData.zipUrl || '',
      authors: formData.authors || [],
      version: '1.0.0',
      keywords: formData.keywords ? formData.keywords.split(',').map(k => k.trim()) : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      partsMetadata: formData.partsMetadata || [],
      audios_path:  '',
    };

    await this.indexedDb.saveContent(content);
    return content;
  }

  
  async getAllContents(): Promise<ContentMetadata[]> {
    return this.indexedDb.getAllContents();
  }

  async getContent(contentId: string): Promise<ContentMetadata | null> {
    return this.indexedDb.getContent(contentId);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

   async generateContentMetadata(title: string, description: string, language: string, context: string = ''): Promise<ContentMetadata> {
    const [systemPrompt, userPrompt] = await this.updatePrompts(
      title,
      description,
      language,
      'metadata',
      context
    );
    const aiResponse = await this.aiService.generateMetadata(
      {
        title,
        description,
        language,
        systemPrompt,
        userPrompt
      }
    );

    const cleanJson = aiResponse.replace(/^```json\n|```$/g, '').trim();
    return JSON.parse(cleanJson);
  }


  async generatePart(id : number, title: string, description: string, language: string, context: string = '', sectionCount: number = 1): Promise<Part> {
    const [systemPrompt, userPrompt] = await this.updatePrompts(
      title,
      description,
      language,
      'part',
      context
    );
    const aiResponse = await this.aiService.generatePart(
      {
        title,
        description,
        language,
        context,
        sectionCount,
        systemPrompt,
        userPrompt
      }
    );
    const cleanJson = aiResponse.replace(/^```json\n|```$/g, '').trim();
    return JSON.parse(cleanJson);
  }


  async generateSection(sectionId: string, title: string, description: string, language: string, context: string = ''): Promise<Section> {
    const [systemPrompt, userPrompt] = await this.updatePrompts(
      title,
      description,
      language,
      'section',
      context
    );
    const aiResponse = await this.aiService.generateSection(
      {
        title,
        description,
        language,
        context,
        systemPrompt,
        userPrompt
      }
    );
    const cleanJson = aiResponse.replace(/^```json\n|```$/g, '').trim();
    console.log("cleanJson", cleanJson);
    // add id to the section
    const section = JSON.parse(cleanJson);
    section.id = sectionId;
    return section;
  } 

  async getSystemPromptTemplate(type: PromptType): Promise<string> {
    return await this.promptService.getSystemPrompt(type).toPromise() || '';
  }

  async getUserPromptTemplate(type: PromptType): Promise<string> {
    return await this.promptService.getUserPrompt(type).toPromise() || '';
  }

  async updatePrompts(
    title: string,
    description: string,
    language: string,
    type: PromptType,
    context: string
  ): Promise<[string, string]> {
    const systemPromptTemplate = await this.getSystemPromptTemplate(type);
    const userPromptTemplate = await this.getUserPromptTemplate(type);

    const systemPrompt = systemPromptTemplate.replace('{{title}}', title)
      .replace('{{description}}', description)
      .replace('{{language}}', language)
      .replace('{{type}}', type)
      .replace('{{context}}', context);

    const userPrompt = userPromptTemplate.replace('{{title}}', title)
      .replace('{{description}}', description)
      .replace('{{language}}', language)
      .replace('{{type}}', type)
      .replace('{{context}}', context);

    return [systemPrompt, userPrompt];
  }

  async saveDraft(formData: ContentFormData): Promise<void> {
    const content = await this.createContent(formData);
    content.status = 'draft';
    await this.indexedDb.saveContent(content);
  }



  async generateContent(title: string, description: string, language: string, context: string = ''): Promise<void> {
    console.log("generating content for " + title);
    try {
      const content = await this.generateContentMetadata(title, description, language, context);
      
      // Ensure content has an ID
      if (!content.id) {
        content.id = this.generateId();
      }
      
      await this.indexedDb.saveContent(content);
      console.log("content metadata generated successfully for " + title, content.id);

      if (content.partsMetadata.length > 0) {
        console.log("generating parts for " + title);
        for (const partMetadata of content.partsMetadata) {
          console.log("generating part " + partMetadata.title);

          const part = await this.generatePart(
            partMetadata.id,
            partMetadata.title, 
            partMetadata.description, 
            language, 
            context, 
            partMetadata.sectionCount
          );

          if (!part.id) {
            part.id = partMetadata.id;
          }

          part.contentId = content.id;
          await this.indexedDb.savePart(content.id, part);
          console.log("part generated successfully for " + partMetadata.title, part.id);
        }
      }
      console.log("content generated successfully for " + title, content.id);
    } catch (error) {
      console.error("Error occurred while generating content for " + title, error);
      throw error;
    }
  }

} 