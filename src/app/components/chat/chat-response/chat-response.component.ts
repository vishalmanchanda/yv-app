import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Reference } from '../../../types/chat';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MarkdownModule } from 'ngx-markdown';

@Component({
  selector: 'app-chat-response',
  standalone: true,
  imports: [CommonModule, NgbModule, MarkdownModule],
  templateUrl: './chat-response.component.html',
  styleUrls: ['./chat-response.component.scss']
})
export class ChatResponseComponent {
  @Input() summary?: string;
  @Input() explanation?: string;
  @Input() references?: Reference[];
  @Input() error?: boolean;

  displayedSummary: string = '';
  displayedExplanation: string = '';
  isSummaryComplete: boolean = false;
  isExplanationComplete: boolean = false;


  ngOnInit() {
    if (this.summary) {
      this.typewriterEffect(this.summary, (text) => this.displayedSummary = text, 15)
        .then(() => {
          this.isSummaryComplete = true;
          if (this.explanation) {
            this.typewriterEffect(this.explanation, (text) => this.displayedExplanation = text, 10);
          }
        });
    } else if (this.explanation) {
      this.typewriterEffect(this.explanation, (text) => this.displayedExplanation = text, 10)
        .then(() => this.isExplanationComplete = true
      
      );
    }
  }

  private async typewriterEffect(
    text: string, 
    updateText: (text: string) => void, 
    speed: number
  ): Promise<void> {
    return new Promise((resolve) => {
      let currentText = '';
      let currentIndex = 0;

      const interval = setInterval(() => {
        if (currentIndex < text.length) {
          currentText += text[currentIndex];
          updateText(currentText);
          currentIndex++;
        } else {
          clearInterval(interval);
          resolve();
        }
      }, speed);
    });
  }
  get showReferences(): boolean {
    console.log(this.isExplanationComplete, this.isSummaryComplete);
    return (!this.summary && !this.explanation) || 
           (!!this.summary && !this.explanation && this.isSummaryComplete) || 
           (!!this.summary && !!this.explanation && this.isExplanationComplete);
  }
}