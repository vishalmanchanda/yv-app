import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar">
      <nav>
        <ul>
          @for (item of menuItems; track item.label) {
            <li>
              <a [routerLink]="item.route" routerLinkActive="active">
                <span class="material-icons">{{item.icon}}</span>
                {{item.label}}
              </a>
            </li>
          }
        </ul>
      </nav>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 250px;
      background: var(--gray-900);
      color: white;
      padding: 1rem;
    }
    ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    li a {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem;
      color: white;
      text-decoration: none;
      border-radius: 4px;
    }
    li a:hover, li a.active {
      background: var(--bright-blue);
    }
  `]
})
export class SidebarComponent {
  @Input() menuItems: any[] = [];
} 