import { Component, Input } from '@angular/core';
import { ChatMessage } from '../../../types/chat';
import { trigger, transition, style, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { ChatResponseComponent } from '../chat-response/chat-response.component';
@Component({
  selector: 'app-message-list',
  templateUrl: './message-list.component.html',
  styleUrls: ['./message-list.component.scss'],
  standalone: true,
  imports: [CommonModule, ChatResponseComponent],
  animations: [
    trigger('messageAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('400ms {{delay}}ms cubic-bezier(0.16, 1, 0.3, 1)', 
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ], { params: { delay: '0' } }),
    ]),
  ]
})
export class MessageListComponent {
  @Input() messages: ChatMessage[] = [];
  
  // Helper method to format timestamps
  formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  }
} 