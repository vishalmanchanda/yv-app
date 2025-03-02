import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatbotComponent } from './chatbot.component';
import { ChatbotService } from './chatbot.service';

@Component({
  selector: 'app-chatbot-mfe',
  standalone: true,
  imports: [CommonModule, ChatbotComponent],
  template: `
    <app-chatbot *ngIf="showChatbot"></app-chatbot>
  `
})
export class ChatbotMfeComponent implements OnInit {
  showChatbot = true;
  
  constructor(private chatbotService: ChatbotService) {}
  
  ngOnInit(): void {
    this.chatbotService.visibility$.subscribe(visible => {
      this.showChatbot = visible;
    });
    
    // Initially show the chatbot
    this.chatbotService.show();
  }
} 