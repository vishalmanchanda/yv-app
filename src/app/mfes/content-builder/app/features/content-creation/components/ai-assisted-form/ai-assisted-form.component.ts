import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { GenAIService } from '../../../../../../../core/services/gen-ai.service';
import { PromptService } from '../../services/prompt.service';
import { CommonModule } from '@angular/common';
import { ContentCreationService } from '../../services/content-creation.service';
import { ContentGenerationService } from '../../../../core/services/content-generation.service';
import { Router } from '@angular/router';
import { v4 as uuidv4 } from 'uuid';
import { environment } from '../../../../../../content-viewer/environments/environment';









@Component({    
  selector: 'app-ai-assisted-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './ai-assisted-form.component.html',
  styleUrls: ['./ai-assisted-form.component.scss']

})
export class AIAssistedFormComponent implements OnInit {
  @Output() formDataChange = new EventEmitter<any>();
  @Output() aiResponseChange = new EventEmitter<any>();
  @Output() createContent = new EventEmitter<any>();

  form: FormGroup;
  promptForm: FormGroup;
  aiResponse: any = null;
  metadata: any = null;
  errorMsg = '';
  isGenerating = false;
  languages = ['en', 'fr', 'es', 'hi'];
  systemPrompt = '';
  userPrompt = '';
   
  
  description = "";
  

  constructor(
    private fb: FormBuilder, 
    private genAiService: GenAIService,
    private promptService: PromptService,
    private contentCreationService: ContentCreationService,
    private contentGenerationService: ContentGenerationService,
    private router: Router
  ) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: [this.description, Validators.required],
      language: ['en', Validators.required],
    });

    this.promptForm = this.fb.group({
      systemPrompt: ['', Validators.required],
      userPrompt: ['', Validators.required]
    });

    // this.metadata = JSON.parse(this.aiGeneratedMetadata);

    this.promptService.getSystemPrompt('metadata').subscribe((systemPrompt: any) => {
      this.promptForm.patchValue({
        systemPrompt: systemPrompt
          .replace('{{title}}', this.form.get('title')?.value || '')
          .replace('{{description}}', this.form.get('description')?.value || '')   
          .replace('{{language}}', this.form.get('language')?.value || '')     
      });
    });

    this.promptService.getUserPrompt('metadata').subscribe((userPrompt: any) => {
      this.promptForm.patchValue({
        userPrompt: userPrompt
          .replace('{{title}}', this.form.get('title')?.value || '')
          .replace('{{description}}', this.form.get('description')?.value || '')        
          .replace('{{language}}', this.form.get('language')?.value || '')     
      });
    });

    this.form.valueChanges.subscribe(value => {
      const formData = {
        ...value,
        partsMetadata: this.metadata?.partsMetadata || []
      };
      this.formDataChange.emit(formData);
      if (this.form.valid) {
        this.aiResponseChange.emit(formData);
      }
    });
  }

  get canGenerateDescription(): boolean {
    return !!this.form.get('title')?.value;
  }

  get canCreate(): boolean {
    return this.form.valid && !this.isGenerating;
  }

  ngOnInit() {

    // Subscribe to prompt changes
    this.promptService.getSystemPrompt('metadata').subscribe((systemPrompt: string) => {

      this.systemPrompt = systemPrompt;
      this.updatePrompts();
    });

    this.promptService.getUserPrompt('metadata').subscribe((userPrompt: string) => {

      this.userPrompt = userPrompt;
      this.updatePrompts();
    });

    // Subscribe to form changes
    this.form.valueChanges.subscribe(values => {

      this.updatePrompts();
    });
  }

  private updatePrompts() {
    if (this.form) {
      const title = this.form.get('title')?.value || '';
      const description = this.form.get('description')?.value || '';
      const language = this.form.get('language')?.value || '';



      const processedSystemPrompt = this.promptService.generatePrompt(this.systemPrompt, {
        title,
        description,
        language
      });

      const processedUserPrompt = this.promptService.generatePrompt(this.userPrompt, {
        title,
        description,
        language
      });

     

      this.promptForm.patchValue({
        systemPrompt: processedSystemPrompt,
        userPrompt: processedUserPrompt
      }, { emitEvent: false });
    }
  }

  async generateDescription(): Promise<void> {
    if (!this.canGenerateDescription) return;
    this.isGenerating = true;

    try {
      const description = await this.genAiService.generateDescription(
        this.form.get('title')?.value
      );
      this.form.patchValue({ description });
    } catch (error) {
      this.errorMsg = 'Failed to generate description';
      console.error('Description Generation Error:', error);
    } finally {
      this.isGenerating = false;
    }
  }

  async generateContent(): Promise<void> {
    if (!this.canCreate) return;
    this.isGenerating = true;
    await this.contentCreationService.generateContent(this.form.value.title, this.form.value.description, this.form.value.language);
    this.router.navigate(['/content-builder']);
  }

  async generateMetadata(): Promise<void> {
    if (!this.canCreate) return;

    try {
      this.isGenerating = true;
      
      const currentPrompts = {
        title: this.form.get('title')?.value,
        description: this.form.get('description')?.value,
        language: this.form.get('language')?.value,
        systemPrompt: this.promptForm.get('systemPrompt')?.value,
        userPrompt: this.promptForm.get('userPrompt')?.value
      };
      const jsonResponse = await this.genAiService.generateMetadata(currentPrompts);
      const cleanJsonString = jsonResponse.replace(/^```json\n|```$/g, '').trim();
      const parsedResponse = JSON.parse(cleanJsonString);
      const { systemPrompt, userPrompt, ...cleanedMetadata } = parsedResponse;
      this.metadata = cleanedMetadata;
      this.aiResponseChange.emit(cleanedMetadata);
    } catch (error) {
      this.errorMsg = 'Failed to generate metadata';
      console.error('Metadata Generation Error:', error);
    } finally {
      this.isGenerating = false;
    }
  }


  async generateMetadataFromService(): Promise<void> {
    // const metadata = await this.contentGenerationService.generateMetadata({
    //   id: uuidv4(),
    //   topic: this.form.get('title')?.value,
    //   description: this.form.get('description')?.value,
    //   model: 'llama3.2'
    // });

  const metadataGenerated = await this.contentGenerationService.generateMetadata({
      id: uuidv4(),
      topic: this.form.get('title')?.value,
      description: this.form.get('description')?.value,
      context: this.form.get('title')?.value + '-' + this.form.get('description')?.value,
      model: environment.LLM_MODEL
    });
    console.log('Metadata from service', metadataGenerated);
    this.metadata = metadataGenerated;
    this.aiResponseChange.emit(metadataGenerated);
  }

  async regenerateMetadata(): Promise<void> {
    this.metadata = null;
    await this.generateMetadata();
  }

  onCreateContent(): void {
    console.log("creating content in ai assisted form component");
    if (this.metadata) {
      this.createContent.emit({
        ...this.form.value,
        metadata: this.metadata
      });
    }
  }
} 
