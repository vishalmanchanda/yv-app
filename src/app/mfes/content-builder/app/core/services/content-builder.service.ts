import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { ContentMetadata, Part, Section } from '../../../../../core/models/content.models';
import { ZipHandlerService } from './zip-handler.service';
import { IndexedDbService } from './indexed-db.service';

@Injectable({
  providedIn: 'root'
})
export class ContentBuilderService {
  private contents = new BehaviorSubject<ContentMetadata[]>([]);
  contents$ = this.contents.asObservable();
  
  private activeContent = new BehaviorSubject<ContentMetadata | null>(null);
  activeContent$ = this.activeContent.asObservable();
  
  private activePart = new BehaviorSubject<Part | null>(null);
  activePart$ = this.activePart.asObservable();
  
  private selectedPartId = new BehaviorSubject<number | null>(null);
  selectedPartId$ = this.selectedPartId.asObservable();
  
  private activeSection = new BehaviorSubject<Section | null>(null);
  activeSection$ = this.activeSection.asObservable();
  
  private loading = new BehaviorSubject<boolean>(false);
  loading$ = this.loading.asObservable();
  
  private saving = new BehaviorSubject<boolean>(false);
  saving$ = this.saving.asObservable();
  
  private error = new BehaviorSubject<string | null>(null);
  error$ = this.error.asObservable();
  
  private isDirty = new BehaviorSubject<boolean>(false);
  isDirty$ = this.isDirty.asObservable();
  
  private lastSaved = new BehaviorSubject<Date | null>(null);
  lastSaved$ = this.lastSaved.asObservable();

  private history = new BehaviorSubject<{
    past: Part[],
    future: Part[]
  }>({ past: [], future: [] });
  history$ = this.history.asObservable();

  canUndo$ = this.history.pipe(
    map(history => history.past.length > 0)
  );
  
  canRedo$ = this.history.pipe(
    map(history => history.future.length > 0)
  );

  constructor(
    private zipHandler: ZipHandlerService,
    private indexedDB: IndexedDbService
  ) {
    this.initDB();
  }

  private async initDB() {
    await this.indexedDB.initDatabase();
  }

  private async fetchContent(contentId: string): Promise<ContentMetadata | null> {
    return this.indexedDB.getContent(contentId);
  }

  async getContentImageUrl(contentId : string): Promise<string> {
    const content = await this.indexedDB.getContent(contentId);
    return content?.coverImage || '';
  }

  private async fetchPart(contentId: string, partId: number): Promise<Part | null> {
    return this.indexedDB.getPart(contentId, partId);
  }
  private async fetchParts(contentId: string): Promise<Part[] | null> {
    
    const parts = await this.indexedDB.getParts(contentId);
    console.log('parts', parts?.length);
    return parts;
  }

  async importContent(file: File): Promise<string> {
    try {
      this.loading.next(true);
      this.error.next(null);
      
      const result = await this.zipHandler.importZip(file);
      
      // Save metadata
      await this.indexedDB.saveContent(result.metadata);
      
      // Save each part separately
      if (result.parts && result.parts.length > 0) {
        for (const part of result.parts) {
          await this.indexedDB.savePart(result.metadata.id, part);
        }
      }
      
      // Update the contents list
      const currentContents = this.contents.value;
      this.contents.next([...currentContents, result.metadata]);
      
      // Load the content and first part
      await this.loadContent(result.metadata.id);
      if (result.parts && result.parts.length > 0) {
        await this.loadPart(result.metadata.id, result.parts[0].id);
      }
      
      return result.metadata.id;
    } catch (error) {
      this.error.next((error as Error).message);
      throw error;
    } finally {
      this.loading.next(false);
    }
  }

  async loadContent(contentId: string): Promise<void> {
    try {
      this.loading.next(true);
      const content = await this.fetchContent(contentId);
      const parts = await this.fetchParts(contentId);
      if (content) {
        this.activeContent.next(content);
        // If content has parts, load the first part by default
        if (parts && parts.length > 0) {
          const firstPartId = parts[0].id;
          await this.loadPart(contentId, firstPartId);
        }
      }
      this.resetEditorState();
    } catch (error) {
      this.error.next((error as Error).message);
    } finally {
      this.loading.next(false);
    }
  }

  async loadPart(contentId: string, partId: number): Promise<void> {
    try {
      this.loading.next(true);
      const part = await this.fetchPart(contentId, partId);
      if (part) {
        this.selectedPartId.next(partId);
        this.activePart.next(part);
        
        // Auto-select first section if available
        if (part.sections && part.sections.length > 0) {
          this.setActiveSection(part.sections[0]);
        } else {
          this.activeSection.next(null);
        }
      }
    } catch (error) {
      this.error.next((error as Error).message);
      console.error('Error loading part:', error);
    } finally {
      this.loading.next(false);
    }
  }


  async updatePart(contentId: string, partId: number, changes: any): Promise<void> {
    try {
      console.log('updatePart changes', changes);
      this.saving.next(true);
      const currentPart = this.activePart.value;
      if (currentPart) {
        const updatedPart = {
          ...currentPart,
          ...changes
        };
        await this.indexedDB.savePart(contentId, updatedPart);
        this.updateHistory(updatedPart);
        this.activePart.next(updatedPart);
        this.isDirty.next(true);
        this.lastSaved.next(new Date());
      }
      console.log('updatePart updatedPart', changes);
    } catch (error) {
      this.error.next((error as Error).message);
      console.error('updatePart error', error);
    } finally {
      this.saving.next(false);
    }
  }

  async updateSection(contentId: string, partId: number, sectionId: string, changes: any): Promise<void> {
    try {
      this.saving.next(true);
      const currentPart = this.activePart.value;
      if (currentPart) {
        const updatedPart = {
          ...currentPart,
          sections: currentPart.sections.map(section =>
            section.id === sectionId.toString() ? { ...section, ...changes, id: sectionId.toString() } : section
          )
        };
        
        await this.indexedDB.savePart(contentId, updatedPart);
        this.updateHistory(currentPart);
        this.activePart.next(updatedPart);
        
        // Update active section if it's the one being modified
        const activeSection = this.activeSection.value;
        if (activeSection && activeSection.id === sectionId.toString()) {
          this.activeSection.next(updatedPart.sections.find(s => s.id === sectionId.toString()) || null);
        }
        
        this.isDirty.next(true);
        this.lastSaved.next(new Date());
      }
    } catch (error) {
      this.error.next((error as Error).message);
    } finally {
      this.saving.next(false);
    }
  }

  private resetEditorState() {
    this.selectedPartId.next(null);
    this.activePart.next(null);
    this.activeSection.next(null);
    this.isDirty.next(false);
    this.lastSaved.next(null);
    this.saving.next(false);
    this.error.next(null);
  }

  loadContents() {
    this.loadAllContents();
  }

  async addSection(contentId: string, partId: number): Promise<void> {
    try {
      this.saving.next(true);
      const currentPart = this.activePart.value;
      
      if (!currentPart) {
        throw new Error('No active part');
      }

      // Create new section with proper string ID
      const maxId = Math.max(0, ...currentPart.sections.map(s => parseInt(s.id)));
      const newSection: Section = {
        id: (maxId + 1).toString(), // Ensure ID is string
        title: `New Section ${maxId + 1}`,
        content: '',
        type: 'default',
        tags: [],
        passage: '',
        meaning: '',
        commentary: '',
        subsections: []

      };

      // Update part with new section
      const updatedPart = {
        ...currentPart,
        sections: [...currentPart.sections, newSection],
        sectionCount: currentPart.sections.length + 1
      };

      // Save first to ensure the section exists in DB
      await this.indexedDB.savePart(contentId, updatedPart);
      
      // Then update state
      this.activePart.next(updatedPart);
      this.activeSection.next(newSection);
      this.isDirty.next(true);
      this.lastSaved.next(new Date());

    } catch (error) {
      this.error.next((error as Error).message);
      console.error('Error adding section:', error);
    } finally {
      this.saving.next(false);
    }
  }

  async deleteSection(contentId: string, partId: number, sectionId: string): Promise<void> {
    try {
      this.saving.next(true);
      const currentPart = this.activePart.value;
      if (currentPart) {
        const updatedPart = {
          ...currentPart,
          sections: currentPart.sections.filter(s => s.id !== sectionId)
        };
        this.updateHistory(currentPart);
        this.activePart.next(updatedPart);
        this.isDirty.next(true);
      }
    } catch (error) {
      this.error.next((error as Error).message);
    } finally {
      this.saving.next(false);
    }
  }

  undo(): void {
    const history = this.history.value;
    const [lastPart, ...past] = history.past;
    const currentPart = this.activePart.value;
    
    if (lastPart && currentPart) {
      this.history.next({
        past,
        future: [currentPart, ...history.future]
      });
      this.activePart.next(lastPart);
      this.isDirty.next(true);
    }
  }

  redo(): void {
    const history = this.history.value;
    const [nextPart, ...future] = history.future;
    const currentPart = this.activePart.value;
    
    if (nextPart && currentPart) {
      this.history.next({
        past: [currentPart, ...history.past],
        future
      });
      this.activePart.next(nextPart);
      
      this.isDirty.next(true);
    }
  }

  private updateHistory(part: Part): void {
    const history = this.history.value;
    this.history.next({
      past: [part, ...history.past].slice(0, 10), // Keep last 10 changes
      future: []
    });
  }

  async updateContentMetadata(contentId: string, metadata: Partial<ContentMetadata>): Promise<void> {
    try {
      this.saving.next(true);
      const currentContent = this.activeContent.value;
      
      if (currentContent) {
        // Update the content metadata
        const updatedContent = {
          ...currentContent,
          ...metadata,
          updatedAt: new Date().toISOString()
        };
        
        // Here you would typically make an API call to persist the changes
        await this.saveContentMetadata(contentId, updatedContent);
        
        this.activeContent.next(updatedContent);
        this.isDirty.next(true);
        this.lastSaved.next(new Date());
      }
    } catch (error) {
      this.error.next((error as Error).message);
      throw error;
    } finally {
      this.saving.next(false);
    }
  }

  validateSection(section: Section): string | null {
    if (!section.title?.trim()) {
      return 'Section title is required';
    }
    
    // if (!section.content?.trim()) {
    //   return 'Section content is required';
    // }
    
    // if (section.content.length < 10) {
    //   return 'Section content must be at least 10 characters long';
    // }
    
    if (!section.type) {
      return 'Section type is required';
    }
    
    const allowedTypes = ['default', 'image', 'video', 'verse', 'quote', 'intro', 'cover']; // Define allowed types directly
    if (!allowedTypes.includes(section.type)) {
      return 'Invalid section type';
    }
    
    return null;
  }

  private async saveContentMetadata(contentId: string, metadata: Partial<ContentMetadata>): Promise<void> {
    await this.indexedDB.saveContent(metadata as ContentMetadata);
  }

  setActiveSection(section: Section | null): void {
    this.activeSection.next(section);
  }

  async addPart(contentId: string): Promise<void> {
    try {
      this.saving.next(true);
      const content = this.activeContent.value;
      
      if (!content) {
        throw new Error('No active content');
      }

      // Create new part with incremented ID
      const newPartId = Math.max(0, ...content.partsMetadata.map(p => p.id)) + 1;
      const newPart: Part = {
        id: newPartId,
        title: `Part ${newPartId}`,
        description: '',
        sectionCount: 0,
        tags: [],
        sections: [],

      };

      // Save the new part
      await this.indexedDB.savePart(contentId, newPart);

      // Update content metadata
      const updatedPartsMetadata = [...content.partsMetadata, {
        id: newPart.id,
        title: newPart.title,
        description: newPart.description,
        sectionCount: newPart.sections.length
      }];

      await this.updateContentMetadata(contentId, {
        partsMetadata: updatedPartsMetadata
      });

      // Set the new part as active
      this.selectedPartId.next(newPart.id);
      this.activePart.next(newPart);
      
    } catch (error) {
      this.error.next((error as Error).message);
      console.error('Error adding part:', error);
    } finally {
      this.saving.next(false);
    }
  }

  async loadAllContents(): Promise<void> {
    try {
      console.log('ContentBuilderService: Loading all contents...');
      this.loading.next(true);
      this.error.next(null);
      
      const contents = await this.indexedDB.getAllContents();
      console.log(`ContentBuilderService: Loaded ${contents.length} contents`);
      
      // If no contents exist, let's create a default sample content
      if (contents.length === 0) {
        console.log('ContentBuilderService: No contents found, creating sample content...');
        try {
          const sampleContent = await this.createSampleContent();
          console.log(`ContentBuilderService: Created sample content with ID: ${sampleContent.id}`);
          this.contents.next([sampleContent]);
        } catch (sampleError) {
          console.error('ContentBuilderService: Error creating sample content:', sampleError);
          // Continue with an empty list if sample creation fails
          this.contents.next([]);
        }
      } else {
        this.contents.next(contents);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error loading contents';
      console.error('ContentBuilderService: Error loading contents:', error);
      this.error.next(errorMessage);
      this.contents.next([]);
    } finally {
      this.loading.next(false);
    }
  }

  /**
   * Creates a sample content with basic structure for demonstration purposes
   */
  private async createSampleContent(): Promise<ContentMetadata> {
    // Create metadata
    const sampleMetadata: ContentMetadata = {
      id: 'sample-' + this.generateId(),
      title: 'Sample Content',
      description: 'This is a sample content created automatically to help you get started',
      authors: [
        {
          id: '1',
          name: 'System',
          image: '',
          bio: 'Auto-generated content',
          website: '',
          authorKey: 'system'
        }
      ],
      type: 'book',
      categoryKey: 'spiritual',
      language: 'en',
      coverImage: '',
      zipUrl: '',
      keywords: ['sample', 'demo', 'getting-started'],
      status: 'draft',
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      audios_path: '',
      partsMetadata: []
    };
    
    // Save metadata
    await this.indexedDB.saveContent(sampleMetadata);
    
    // Create first part
    const part1: Part = {
      id: 1,
      title: 'Introduction',
      description: 'Getting started with Content Builder',
      sectionCount: 2,
      sections: [
        {
          id: '1',
          title: 'Welcome',
          type: 'intro',
          content: '# Welcome to Content Builder\n\nThis is a sample content created to help you get started. You can edit this content or create a new one.\n\n## Key features\n\n- Create and edit content\n- Add sections and parts\n- Export and import content',
          subsections: []
        },
        {
          id: '2',
          title: 'How to use',
          type: 'intro',
          content: '# How to use Content Builder\n\n1. **Edit this content**: Click on any section to edit it\n2. **Add new sections**: Use the + button to add more sections\n3. **Create new content**: Go back to the browser and click "Create New"',
          subsections: []
        }
      ]
    };
    
    // Save part
    await this.indexedDB.savePart(sampleMetadata.id, part1);
    
    return sampleMetadata;
  }
  
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
  }

  async deleteContent(contentId: string): Promise<void> {
    try {
      this.loading.next(true);
      await this.indexedDB.deleteContent(contentId);
      
      // Update contents list
      const currentContents = this.contents.value;
      this.contents.next(currentContents.filter(c => c.id !== contentId));
      
      // Reset state if the deleted content was active
      if (this.activeContent.value?.id === contentId) {
        this.resetEditorState();
        this.activeContent.next(null);
      }
    } catch (error) {
      this.error.next((error as Error).message);
      console.error('Error deleting content:', error);
    } finally {
      this.loading.next(false);
    }
  }

  async exportContent(contentId: string): Promise<Blob> {
    try {
      this.loading.next(true);
      
      // Fetch content metadata
      const metadata = await this.fetchContent(contentId);
      if (!metadata) {
        throw new Error('Content not found');
      }
      
      // Fetch all parts
      const parts = await this.fetchParts(contentId);
      if (!parts) {
        throw new Error('Parts not found');
      }
      
      // Prepare export data
      const exportData = {
        metadata,
        parts,
        images: {} // Add image support if needed
      };
      
      // Create and return zip file
      return await this.zipHandler.createZip(exportData);
      
    } catch (error) {
      this.error.next((error as Error).message);
      throw error;
    } finally {
      this.loading.next(false);
    }
  }

  async isReadyForPreview(contentId: string): Promise<boolean> {
    const ready = await this.indexedDB.copyContentToViewer(contentId);
    return ready;
  }
} 
