import { Component, EventEmitter, Input, Output } from '@angular/core';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-query-suggestions',
  templateUrl: './query-suggestions.component.html',
  standalone: true,
  imports: [CommonModule],
  animations: [
    trigger('listAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(8px)' }),
          stagger('60ms', [
            animate('250ms cubic-bezier(0.16, 1, 0.3, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class QuerySuggestionsComponent {
  @Input() suggestions: string[] = [];
  @Input() predictedQuery?: string | null;
  @Output() selectSuggestion = new EventEmitter<string>();
  @Output() clearInput = new EventEmitter<void>();
  
  onSelectSuggestion(suggestion: string): void {
    if (suggestion) {
      this.selectSuggestion.emit(suggestion);
      this.clearInput.emit();
    }
  }
} 