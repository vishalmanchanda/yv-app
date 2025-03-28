import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-json-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="json-view">
      <div class="form-group">
        <!-- <label for="jsonEditor">JSON View</label> -->
        <textarea class="form-control"
                  id="jsonEditor"
                  [value]="formatJson(data)"
                  (input)="onJsonChange($event)"
                  rows="25"></textarea>
      </div>
    </div>
  `,
  styles: [`
    .json-view {
      max-height: 68vh;
      padding: 1rem;
    }
    textarea {
      font-family: monospace;
      font-size: 14px;
    }
  `]
})
export class JsonViewComponent {
  @Input() data: any;
  @Output() dataChange = new EventEmitter<any>();

  formatJson(data: any): string {
    return JSON.stringify(data, null, 2);
  }

  onJsonChange(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    try {
      const parsedData = JSON.parse(textarea.value);
      this.dataChange.emit(parsedData);
    } catch (e) {
      console.error('Invalid JSON');
    }
  }
} 