import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button class="theme-toggle" (click)="toggleTheme()">
      <i class="bi" [class.bi-moon-fill]="!isDark" [class.bi-sun-fill]="isDark"></i>
    </button>
  `,
  styles: [`
    .theme-toggle {
      background: transparent;
      border: none;
      color: inherit;
      padding: 0.5rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      transition: background-color 0.2s;
    }

    .theme-toggle:hover {
      background-color: rgba(var(--bs-primary-rgb), 0.1);
    }

    .bi {
      font-size: 1.2rem;
    }
  `]
})
export class ThemeToggleComponent {
  isDark = false;

  constructor(private themeService: ThemeService) {
    this.themeService.theme$.subscribe(theme => {
      this.isDark = theme === 'dark';
    });
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }
} 