import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar">
      <div class="brand">
        <h1>{{brandName}}</h1>
      </div>
      <div class="user-menu">
        <img [src]="user.avatar" [alt]="user.name" class="avatar"/>
        <span>{{user.name}}</span>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: var(--bright-blue);
      color: white;
    }
    .brand h1 {
      margin: 0;
      font-size: 1.5rem;
    }
    .user-menu {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
    }
  `]
})
export class NavbarComponent {
  @Input() brandName: string = '';
  @Input() user: any;
} 