import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'mfe1-example',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mfe-container">
      <h2>Embedded MFE 1</h2>
      <div class="feature-card">
        <h3>Feature Overview</h3>
        <p>This is an embedded microfrontend that can be extracted later.</p>
        
        <div class="demo-controls">
          <button (click)="counter = counter + 1">
            Count: {{ counter }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .mfe-container {
      padding: 20px;
    }
    .feature-card {
      background: white;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .demo-controls {
      margin-top: 20px;
    }
    button {
      padding: 10px 20px;
      border: none;
      border-radius: 5px;
      background: var(--bright-blue);
      color: white;
      cursor: pointer;
    }
  `]
})
export class ExampleComponent {
  counter = 0;
} 