import { Component, EventEmitter, Input, Output, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat-input',
  templateUrl: './chat-input.component.html',
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class ChatInputComponent implements AfterViewInit {
  @Input() isLoading = false;
  @Output() sendMessage = new EventEmitter<string>();
  @Output() inputChange = new EventEmitter<string>();
  @Output() clearInput = new EventEmitter<void>();
  @ViewChild('messageInput') messageInput!: ElementRef;
  
  inputValue = '';
  
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
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';
  }
} 