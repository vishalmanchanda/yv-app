import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chatbot-container" [class.expanded]="isExpanded">
      <div class="chatbot-header" (click)="toggleExpand()">
        <h5 class="mb-0">
          <i class="bi bi-chat-dots me-2"></i> 
          Support Chat
        </h5>
        <button class="btn-close text-white" *ngIf="isExpanded" (click)="toggleExpand(); $event.stopPropagation()"></button>
      </div>
      
      <div class="chatbot-body" *ngIf="isExpanded">
        <div class="messages-container">
          <div *ngFor="let message of messages" 
               class="message" 
               [class.user-message]="message.sender === 'user'"
               [class.bot-message]="message.sender === 'bot'">
            <div class="message-content">
              {{ message.text }}
            </div>
            <div class="message-time">
              {{ message.timestamp | date:'shortTime' }}
            </div>
          </div>
          
          <div *ngIf="isTyping" class="message bot-message typing-indicator">
            <div class="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
        
        <div class="input-container">
          <input type="text" 
                 class="form-control" 
                 placeholder="Type your message..." 
                 [(ngModel)]="currentMessage" 
                 (keyup.enter)="sendMessage()"
                 [disabled]="isTyping">
          <button class="btn btn-primary send-button" 
                  [disabled]="!currentMessage.trim() || isTyping"
                  (click)="sendMessage()">
            <i class="bi bi-send"></i>
          </button>
        </div>
      </div>
      
      <div class="chatbot-button" *ngIf="!isExpanded" (click)="toggleExpand()">
        <i class="bi bi-chat-dots"></i>
      </div>
    </div>
  `,
  styles: [`
    .chatbot-container {
      position: fixed;
      bottom: 80px;
      right: 20px;
      z-index: 1000;
      width: 350px;
      border-radius: 10px;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
      background-color: white;
      overflow: hidden;
      transition: all 0.3s ease;
    }
    
    .chatbot-header {
      background-color: var(--bs-primary);
      color: white;
      padding: 15px;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .chatbot-body {
      height: 400px;
      display: flex;
      flex-direction: column;
    }
    
    .messages-container {
      flex: 1;
      overflow-y: auto;
      padding: 15px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    
    .message {
      max-width: 80%;
      padding: 10px 15px;
      border-radius: 18px;
      position: relative;
      margin-bottom: 5px;
    }
    
    .user-message {
      align-self: flex-end;
      background-color: var(--bs-primary);
      color: white;
      border-bottom-right-radius: 5px;
    }
    
    .bot-message {
      align-self: flex-start;
      background-color: #f1f1f1;
      color: #333;
      border-bottom-left-radius: 5px;
    }
    
    .message-time {
      font-size: 0.7rem;
      opacity: 0.7;
      margin-top: 5px;
      text-align: right;
    }
    
    .input-container {
      display: flex;
      padding: 10px;
      border-top: 1px solid #eee;
    }
    
    .input-container .form-control {
      border-radius: 20px;
      margin-right: 10px;
    }
    
    .send-button {
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
    }
    
    .chatbot-button {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background-color: var(--bs-primary);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      cursor: pointer;
      box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
    }
    
    .typing-indicator {
      padding: 10px 15px;
    }
    
    .typing-dots {
      display: flex;
      gap: 5px;
    }
    
    .typing-dots span {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: #888;
      display: inline-block;
      animation: typing 1.4s infinite ease-in-out both;
    }
    
    .typing-dots span:nth-child(1) {
      animation-delay: 0s;
    }
    
    .typing-dots span:nth-child(2) {
      animation-delay: 0.2s;
    }
    
    .typing-dots span:nth-child(3) {
      animation-delay: 0.4s;
    }
    
    @keyframes typing {
      0%, 80%, 100% { transform: scale(0.6); }
      40% { transform: scale(1); }
    }
  `]
})
export class ChatbotComponent implements OnInit {
  isExpanded = false;
  messages: ChatMessage[] = [];
  currentMessage = '';
  isTyping = false;
  
  // Sample bot responses
  botResponses = [
    "Hello! How can I help you today?",
    "I'm sorry, I don't understand. Could you rephrase that?",
    "That's an interesting question. Let me find the answer for you.",
    "Thank you for your message. Our team will get back to you shortly.",
    "I'm here to assist with any questions about our application.",
    "Could you provide more details about your issue?",
    "Have you tried refreshing the page or clearing your cache?",
    "That feature is currently in development and will be available soon."
  ];
  
  ngOnInit(): void {
    // Add welcome message
    setTimeout(() => {
      this.addBotMessage("Hello! I'm your virtual assistant. How can I help you today?");
    }, 1000);
  }
  
  toggleExpand(): void {
    this.isExpanded = !this.isExpanded;
  }
  
  sendMessage(): void {
    if (!this.currentMessage.trim() || this.isTyping) return;
    
    // Add user message
    this.addUserMessage(this.currentMessage);
    const userQuestion = this.currentMessage;
    this.currentMessage = '';
    
    // Simulate bot typing
    this.isTyping = true;
    
    // Simulate bot response after a delay
    setTimeout(() => {
      this.isTyping = false;
      this.generateBotResponse(userQuestion);
    }, 1500);
  }
  
  private addUserMessage(text: string): void {
    this.messages.push({
      sender: 'user',
      text,
      timestamp: new Date()
    });
    
    // Scroll to bottom
    this.scrollToBottom();
  }
  
  private addBotMessage(text: string): void {
    this.messages.push({
      sender: 'bot',
      text,
      timestamp: new Date()
    });
    
    // Scroll to bottom
    this.scrollToBottom();
  }
  
  private scrollToBottom(): void {
    setTimeout(() => {
      const messagesContainer = document.querySelector('.messages-container');
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }, 0);
  }
  
  private generateBotResponse(userQuestion: string): void {
    // Simple keyword-based responses
    let response = '';
    
    if (userQuestion.toLowerCase().includes('hello') || 
        userQuestion.toLowerCase().includes('hi')) {
      response = "Hello! How can I help you today?";
    } 
    else if (userQuestion.toLowerCase().includes('help')) {
      response = "I can help with application navigation, feature explanations, and troubleshooting. What do you need help with?";
    }
    else if (userQuestion.toLowerCase().includes('feature') || 
             userQuestion.toLowerCase().includes('functionality')) {
      response = "Our application has many features including user management, analytics, and customizable dashboards. Which feature would you like to know more about?";
    }
    else if (userQuestion.toLowerCase().includes('error') || 
             userQuestion.toLowerCase().includes('problem') ||
             userQuestion.toLowerCase().includes('issue')) {
      response = "I'm sorry you're experiencing an issue. Could you describe the problem in more detail? Or you can contact our support team at support@example.com.";
    }
    else if (userQuestion.toLowerCase().includes('thank')) {
      response = "You're welcome! Is there anything else I can help you with?";
    }
    else {
      // Random response if no keywords match
      const randomIndex = Math.floor(Math.random() * this.botResponses.length);
      response = this.botResponses[randomIndex];
    }
    
    this.addBotMessage(response);
  }
} 