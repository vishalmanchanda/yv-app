import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ContentCreationService } from '../../services/content-creation.service';
import { ContentFormData, ContentFormTab } from '../../models/content-form.model';
import { IndexedDbService } from '../../../../core/services/indexed-db.service';
import { CommonModule } from '@angular/common';
import { PromptTabsComponent } from '../prompt-tabs/prompt-tabs.component';
import { AIAssistedFormComponent } from '../ai-assisted-form/ai-assisted-form.component';
import { BottomToolbarComponent } from '../bottom-toolbar/bottom-toolbar.component';
import { PromptService } from '../../services/prompt.service';
import { PartMetadata, Part, ContentMetadata } from '../../../../../../../core/models/content.models';
import { ToastService } from '../../../../../../content-renderer/core/services/toast.service';





@Component({    
  selector: 'app-new-content',
  standalone: true,
  imports: [CommonModule, PromptTabsComponent, AIAssistedFormComponent, BottomToolbarComponent],
  templateUrl: './new-content.component.html',

})
export class NewContentComponent implements OnInit, AfterViewInit {
  ContentFormTab = ContentFormTab; // For template access
  activeTab: ContentFormTab = ContentFormTab.AI_ASSISTED;
  formData: ContentFormData | null = null;
  aiResponse: any = null; // Store AI generated content
  isLoading = false;
  error: string | null = null;
  isFormValid = false;
  systemPrompt = '';
  userPrompt = '';

  constructor(
    private router: Router,
    private contentService: ContentCreationService,
    private indexedDb: IndexedDbService,
    private promptService: PromptService,
    private toastService: ToastService
  ) {}

  async ngOnInit() {
    await this.indexedDb.initDatabase();
    
    await this.promptService.getSystemPrompt('metadata').subscribe((prompt: string) => {
      this.systemPrompt = prompt;
    });
    await this.promptService.getUserPrompt('metadata').subscribe((prompt: string) => {
      this.userPrompt = prompt;
    });

    this.isFormValid = (this.formData && this.formData.title !== '' && this.formData.description !== '' ) || false;
  }

  ngAfterViewInit(): void {
    this.isFormValid = (this.formData && this.formData.title !== '' && this.formData.description !== '' ) || false;
  }

  setActiveTab(tab: ContentFormTab) {
    this.activeTab = tab;
  }

  onFormDataChange(data: ContentFormData) {
    this.formData = {
      ...data,
      partsMetadata: data.partsMetadata || this.aiResponse?.partsMetadata || []
    };
    this.isFormValid = !!data && !!data.title && !!data.description;
  }

  onAIResponseChange(response: any) {
    this.aiResponse = response;
    if (this.formData) {
      console.log('AI Response received:', response);
      console.log('Previous formData:', { ...this.formData });
      
      this.formData = {
        ...this.formData,
        partsMetadata: response.partsMetadata || []
      };
      
      console.log('Updated formData:', this.formData);
    }
  }

  isAITab(): boolean {
    return this.activeTab === ContentFormTab.AI_ASSISTED;
  }

  async onSaveDraft() {
    if (!this.formData) {
      this.error = 'No form data to save';
      return;
    }

    try {
      this.isLoading = true;
      await this.contentService.saveDraft(this.formData);
      await this.showSuccessAndNavigate('Draft saved successfully');
    } catch (error) {
      this.handleError(error);
    } finally {
      this.isLoading = false;
    }
  }

  async onCreate() {
    if (!this.formData) {
      this.error = 'Please fill in the required form data';
      return;
    }
    try {
      this.isLoading = true;
      this.toastService.show('','Navigating to content builder...');
      
      // Log the formData to verify partsMetadata is present
      console.log('Form data before create:', this.formData);
      
      // Make sure partsMetadata is explicitly included in the request
      const contentToCreate = {
        ...this.formData,
        partsMetadata: this.formData.partsMetadata || []
      };
      
      const content = await this.contentService.createContent(contentToCreate);
      console.log('Content created:', content);
      
      await this.createPartsIfNotExists(content);
      console.log('Parts created:', content);

      await this.showSuccessAndNavigate('Content created successfully');
    } catch (error) {
      this.handleError(error);
    } finally {
      this.isLoading = false;
    }
  }
  async  createPartsIfNotExists(contentMetadata: ContentMetadata) {
    try {
  
      // Create or update parts based on partsMetadata
      if (contentMetadata.partsMetadata?.length) {
        const partPromises = contentMetadata.partsMetadata.map(async (partMeta: PartMetadata) => {
            // Create new part with empty sections
            const newPart: Part = {
              id: partMeta.id,
              title: partMeta.title,
              description: partMeta.description,
              contentId: contentMetadata.id,
              sections: Array(partMeta.sectionMetadata?.length || 0).fill(null).map((_, index) => ({
                id: partMeta.sectionMetadata?.[index]?.id.toString() || (index + 1).toString(),
                title:  partMeta.sectionMetadata?.[index]?.title ||  `Section ${index + 1}`,
                content: 'Generate content in Part : ' + partMeta?.title + '\n Section : ' + partMeta.sectionMetadata?.[index]?.title,
                type:  partMeta.sectionMetadata?.[index]?.type || 'default',
                subsections: [],
              })),
              tags: partMeta.tags || [],
              sectionCount: partMeta.sectionMetadata?.length || 0
            };
            if (contentMetadata.id) {
              await this.indexedDb.savePart(contentMetadata.id, newPart);
            }
          }
        );
        await Promise.all(partPromises);
      }
  
    } catch (error) {
      console.error('Error creating parts:', error);
    }
  }
  onCancel() {
    this.router.navigate(['/browser']);
  }

  private async showSuccessAndNavigate(message: string) {

    await new Promise(resolve => setTimeout(resolve, 1500));
    this.router.navigate(['/browser']);
  }

  private handleError(error: any) {
    console.error('Operation failed:', error);
    this.error = 'Operation failed. Please try again.';
  }

  onSystemPromptChange(prompt: string) {
    this.systemPrompt = prompt;   
  }

  onUserPromptChange(prompt: string) {
    this.userPrompt = prompt;
  }


} 