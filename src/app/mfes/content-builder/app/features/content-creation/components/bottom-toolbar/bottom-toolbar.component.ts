import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';

@Component({
  selector: 'app-bottom-toolbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bottom-toolbar.component.html',
  styles: [`
    .bottom-toolbar {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 1rem;
      border-top: 1px solid #dee2e6;
      z-index: 1000;
    }
  `]
})
export class BottomToolbarComponent  {
  @Input() showAiOptions = false;
  @Input() isFormValid = false;
  @Output() canceled = new EventEmitter<void>();  
  @Output() saveDraft = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();
  

  openAIChat(type: string) {
    const urls: Record<string, string> = {
      chatgpt: 'https://chat.openai.com',
      gemini: 'https://gemini.google.com',
      claude: 'https://claude.ai'
    };
    window.open(urls[type], '_blank');
  }

  
} 