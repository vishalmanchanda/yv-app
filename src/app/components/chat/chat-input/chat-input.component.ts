import { Component, EventEmitter, Input, Output, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat-input',
  templateUrl: './chat-input.component.html',
  styleUrls: ['./chat-input.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class ChatInputComponent implements AfterViewInit {
  @Input() isLoading = false;
  @Output() sendMessage = new EventEmitter<string>();
  @Output() inputChange = new EventEmitter<string>();
  @Output() clearInput = new EventEmitter<void>();
  @ViewChild('messageInput') messageInput!: ElementRef<HTMLTextAreaElement>;
  
  inputValue = '';
  private readonly maxRows = 5;
  
  ngAfterViewInit() {
    this.adjustTextareaHeight();
  }
  
  onInputChange(): void {
    this.inputChange.emit(this.inputValue);
    this.adjustTextareaHeight();
  }
  
  onSendMessage(): void {
    if (this.inputValue.trim() && !this.isLoading) {
      this.sendMessage.emit(this.inputValue);
      this.inputValue = '';
      this.clearInput.emit();
      this.adjustTextareaHeight();
    }
  }
  
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSendMessage();
    }
  }
  
  private adjustTextareaHeight(): void {
    const textarea = this.messageInput.nativeElement;
    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';
    
    // Calculate the number of rows based on scrollHeight
    const lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
    const paddingTop = parseInt(getComputedStyle(textarea).paddingTop);
    const paddingBottom = parseInt(getComputedStyle(textarea).paddingBottom);
    const rows = Math.min(
      Math.floor((textarea.scrollHeight - paddingTop - paddingBottom) / lineHeight),
      this.maxRows
    );
    
    // Set the height based on the number of rows
    textarea.style.height = `${(rows * lineHeight) + paddingTop + paddingBottom}px`;
    
    // Enable/disable scrolling based on content height
    textarea.style.overflowY = rows === this.maxRows ? 'auto' : 'hidden';
  }
} 