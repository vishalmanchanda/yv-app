import { Component, OnInit } from '@angular/core';
import { ChatMessage } from '../../types/chat';
import { ChatService } from '../../services/chat.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { MessageListComponent } from './message-list/message-list.component';
import { ChatInputComponent } from './chat-input/chat-input.component';
import { QuerySuggestionsComponent } from './query-suggestions/query-suggestions.component';

// Predefined categories for question suggestions
const suggestionCategories = [
  {
    icon: "🕉️",
    title: "Spiritual Concepts",
    questions: [
      "What is karma yoga?",
      "Explain the concept of dharma",
      "What are the four paths of yoga?",
    ],
  },
  {
    icon: "🧘",
    title: "Meditation & Practice",
    questions: [
      "How to start meditation practice?",
      "What are the benefits of pranayama?",
      "Guide me through basic meditation",
    ],
  },
  {
    icon: "📚",
    title: "Gita Teachings",
    questions: [
      "What does Gita say about duty?",
      "Explain Chapter 2 Verse 47",
      "Purpose of life according to Gita",
    ],
  },
  {
    icon: "🎯",
    title: "Life Application",
    questions: [
      "How to apply Gita in daily life?",
      "Managing stress through Gita",
      "Work-life balance in Gita",
    ],
  },
];

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  standalone: true,
  imports: [CommonModule, MessageListComponent, ChatInputComponent, QuerySuggestionsComponent],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('400ms ease-in', style({ opacity: 1 })),
      ]),
    ]),
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
  ]
})
export class ChatComponent implements OnInit {
  // State to store chat messages
  messages: ChatMessage[] = [];
  // State for autocomplete suggestions
  suggestions: string[] = [];
  // State to store the predicted query
  predictedQuery: string | null = null;
  // Loading state for API response
  isLoading = false;
  // Categories for suggestions
  suggestionCategories = suggestionCategories;

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {}

  /**
   * Handles sending user messages and getting bot responses.
   * @param content - The user-input message.
   */
  async handleSendMessage(content: string): Promise<void> {
    if (!content.trim()) return; // Ignore empty messages
  
    // Create user message object
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };
  
    // Update chat messages
    this.messages = [...this.messages, userMessage];
  
    // Clear suggestions & input
    this.suggestions = [];
    this.predictedQuery = null;
  
    // Fetch response from API
    this.isLoading = true;
    try {
        const response = await this.chatService.getChatResponse(content);
      this.messages = [...this.messages, response]; // Append bot response
    } catch (error) {
      console.error("Error fetching response:", error);
    } finally {
      this.isLoading = false;
    }
  }
  
  /**
   * Handles input change and fetches suggestions + predicted query.
   * @param input - The text entered by the user.
   */
  async handleInputChange(input: string): Promise<void> {
    if (!input.trim()) {
      this.suggestions = [];
      this.predictedQuery = null;
      return;
    }

    try {
      const [newSuggestions, predicted] = await Promise.all([
        this.chatService.getSuggestions(input),
        this.chatService.getPredictedQuery(input),
      ]);
      this.suggestions = newSuggestions;
      this.predictedQuery = predicted;
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  }
} 