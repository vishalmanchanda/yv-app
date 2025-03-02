import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <h2>Login</h2>
        <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
          <div class="form-group">
            <label for="email">Email</label>
            <input 
              type="email" 
              class="form-control" 
              id="email" 
              [(ngModel)]="credentials.email" 
              name="email" 
              required>
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input 
              type="password" 
              class="form-control" 
              id="password" 
              [(ngModel)]="credentials.password" 
              name="password" 
              required>
          </div>
          <button type="submit" class="btn btn-primary w-100" [disabled]="!loginForm.form.valid">
            Login
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f8f9fa;
    }

    .login-card {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      width: 100%;
      max-width: 400px;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    label {
      margin-bottom: 0.5rem;
      display: block;
    }

    .form-control {
      width: 100%;
      padding: 0.375rem 0.75rem;
      border: 1px solid #ced4da;
      border-radius: 0.25rem;
    }
  `]
})
export class LoginComponent {
  credentials = {
    email: '',
    password: ''
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  onSubmit() {
    this.authService.login(this.credentials).subscribe({
      next: () => {
        this.notificationService.success('Successfully logged in');
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.notificationService.error(
          'Invalid credentials. Please try again.',
          'Login Failed'
        );
      }
    });
  }
} 