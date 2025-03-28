import { Component, Input, OnInit, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { PromptService, PromptType } from '../../services/prompt.service';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-prompt-tabs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './prompt-tabs.component.html',
  styleUrls: ['./prompt-tabs.component.scss']
})
export class PromptTabsComponent implements OnInit, OnChanges {
  @Input() title = '';
  @Input() description = '';
  @Input() language = '';
  @Input() context = '';
  @Input() type : PromptType = 'metadata';
  @Output() userPromptChange = new EventEmitter<string>();
  @Output() systemPromptChange = new EventEmitter<string>();
  
  activeTab: 'system' | 'user' = 'user';
  systemPromptTemplate = '';
  userPromptTemplate = '';
  
  systemPrompt = '';
  userPrompt = '';

  isLoading = true;
  copySuccess = false;

  constructor(private promptService: PromptService) {}

  ngOnInit() {
    this.loadPromptTemplates();
  }

  ngOnChanges(changes: SimpleChanges) {
    if ((changes['title'] || changes['description'] || changes['language'] || changes['context']) && 
        (this.systemPromptTemplate || this.userPromptTemplate)) {
      this.updatePrompts();
    }
  }

  private loadPromptTemplates() {
    this.isLoading = true;
    
    const systemPrompt$ = this.promptService.getSystemPrompt(this.type);
    const userPrompt$ = this.promptService.getUserPrompt(this.type);

    Promise.all([
      firstValueFrom(systemPrompt$),
      firstValueFrom(userPrompt$)
    ]).then(([systemTemplate, userTemplate]) => {
      this.systemPromptTemplate = systemTemplate;
      this.userPromptTemplate = userTemplate;
      this.updatePrompts();
      this.isLoading = false;
    }).catch(error => {
      console.error('Error loading prompts:', error);
      this.isLoading = false;
    });
  }

  private updatePrompts() {
    this.systemPrompt = this.promptService.generatePrompt(
      this.systemPromptTemplate,
      { title: this.title, description: this.description }
    );
    
    this.userPrompt = this.promptService.generatePrompt(
      this.userPromptTemplate,
      { title: this.title, description: this.description }
    );
    this.systemPromptChange.emit(this.systemPrompt);
    this.userPromptChange.emit(this.userPrompt);
  }

  setActiveTab(tab: 'system' | 'user') {
    this.activeTab = tab;
  }

  async copyPrompt(prompt: string) {
    try {
      await navigator.clipboard.writeText(prompt);
      this.copySuccess = true;
      setTimeout(() => this.copySuccess = false, 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  }

  getActivePrompt(): string {
    return this.activeTab === 'system' ? this.systemPrompt : this.userPrompt;
  }

  onSystemPromptChange(newPrompt: string) {
    this.systemPrompt = newPrompt;
    this.systemPromptChange.emit(this.systemPrompt);
  }

  onUserPromptChange(newPrompt: string) {
    this.userPrompt = newPrompt;
    this.userPromptChange.emit(this.userPrompt);
  }
} 