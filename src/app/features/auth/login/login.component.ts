import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { SocialAuthService } from '../../../core/auth/social-auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <img src="assets/logo.png" alt="Logo" class="login-logo">
          <h1>Welcome Back</h1>
          <p class="text-muted">Sign in to continue to the application</p>
        </div>
        
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
          <div class="alert alert-info" *ngIf="showDemoCredentials">
            <strong>Demo Credentials:</strong><br>
            Email: admin&#64;example.com<br>
            Password: password123
            <button type="button" class="btn-close" (click)="showDemoCredentials = false"></button>
          </div>
          
          <div class="mb-3">
            <label for="email" class="form-label">Email</label>
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-envelope"></i></span>
              <input 
                type="email" 
                id="email" 
                formControlName="email" 
                class="form-control" 
                placeholder="Enter your email"
                [ngClass]="{'is-invalid': submitted && f['email'].errors}"
              >
            </div>
            <div *ngIf="submitted && f['email'].errors" class="invalid-feedback d-block">
              <div *ngIf="f['email'].errors['required']">Email is required</div>
              <div *ngIf="f['email'].errors['email']">Please enter a valid email</div>
            </div>
          </div>
          
          <div class="mb-3">
            <div class="d-flex justify-content-between">
              <label for="password" class="form-label">Password</label>
              <a href="javascript:void(0)" class="text-decoration-none small">Forgot password?</a>
            </div>
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-lock"></i></span>
              <input 
                [type]="showPassword ? 'text' : 'password'" 
                id="password" 
                formControlName="password" 
                class="form-control" 
                placeholder="Enter your password"
                [ngClass]="{'is-invalid': submitted && f['password'].errors}"
              >
              <button 
                class="input-group-text bg-transparent" 
                type="button"
                (click)="togglePasswordVisibility()"
              >
                <i [class]="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
              </button>
            </div>
            <div *ngIf="submitted && f['password'].errors" class="invalid-feedback d-block">
              <div *ngIf="f['password'].errors['required']">Password is required</div>
              <div *ngIf="f['password'].errors['minlength']">Password must be at least 6 characters</div>
            </div>
          </div>
          
          <div class="mb-3 form-check">
            <input type="checkbox" class="form-check-input" id="rememberMe" formControlName="rememberMe">
            <label class="form-check-label" for="rememberMe">Remember me</label>
          </div>
          
          <div class="d-grid gap-2">
            <button 
              type="submit" 
              class="btn btn-primary" 
              [disabled]="loading"
            >
              <span *ngIf="loading" class="spinner-border spinner-border-sm me-1"></span>
              Sign In
            </button>
            
            <button 
              type="button" 
              class="btn btn-outline-secondary" 
              (click)="showDemoCredentials = true"
            >
              Show Demo Credentials
            </button>
          </div>
        </form>
        
        <div class="social-login">
          <div class="divider">
            <span>or continue with</span>
          </div>
          
          <div class="d-grid gap-2">
            <button 
              type="button" 
              class="btn btn-outline-danger social-btn" 
              (click)="loginWithGoogle()"
              [disabled]="loading"
            >
              <i class="bi bi-google me-2"></i> Google
            </button>
            
            <button 
              type="button" 
              class="btn btn-outline-primary social-btn" 
              (click)="loginWithFacebook()"
              [disabled]="loading"
            >
              <i class="bi bi-facebook me-2"></i> Facebook
            </button>
          </div>
        </div>
        
        <div class="login-footer">
          <p class="text-center mb-0">
            Don't have an account? <a href="javascript:void(0)" class="text-decoration-none">Sign up</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      padding: 20px;
    }
    
    .login-card {
      width: 100%;
      max-width: 450px;
      background-color: white;
      border-radius: 10px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      padding: 30px;
    }
    
    .login-header {
      text-align: center;
      margin-bottom: 30px;
    }
    
    .login-logo {
      height: 60px;
      margin-bottom: 20px;
    }
    
    .login-form {
      margin-bottom: 20px;
    }
    
    .social-login {
      margin-top: 20px;
      margin-bottom: 20px;
    }
    
    .divider {
      display: flex;
      align-items: center;
      text-align: center;
      margin: 20px 0;
    }
    
    .divider::before,
    .divider::after {
      content: '';
      flex: 1;
      border-bottom: 1px solid #dee2e6;
    }
    
    .divider span {
      padding: 0 10px;
      color: #6c757d;
      font-size: 0.875rem;
    }
    
    .social-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 10px;
    }
    
    .login-footer {
      margin-top: 20px;
      color: #6c757d;
    }
    
    @media (prefers-color-scheme: dark) {
      .login-container {
        background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
      }
      
      .login-card {
        background-color: #2d3748;
        color: #e2e8f0;
      }
      
      .text-muted {
        color: #a0aec0 !important;
      }
      
      .divider span {
        color: #a0aec0;
      }
      
      .login-footer {
        color: #a0aec0;
      }
    }
  `]
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  submitted = false;
  showPassword = false;
  showDemoCredentials = false;
  
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private socialAuthService: SocialAuthService,
    private notificationService: NotificationService
  ) {}
  
  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }
  
  get f() { return this.loginForm.controls; }
  
  onSubmit(): void {
    this.submitted = true;
    
    if (this.loginForm.invalid) {
      return;
    }
    
    this.loading = true;
    
    const { email, password, rememberMe } = this.loginForm.value;
    
    this.authService.login(email, password, rememberMe)
      .subscribe({
        next: () => {
          this.notificationService.success('Login successful');
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.notificationService.error(error || 'Login failed');
          this.loading = false;
        }
      });
  }
  
  loginWithGoogle(): void {
    this.loading = true;
    this.socialAuthService.loginWithGoogle()
      .subscribe({
        next: () => {
          this.notificationService.success('Google login successful');
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.notificationService.error(error || 'Google login failed');
          this.loading = false;
        }
      });
  }
  
  loginWithFacebook(): void {
    this.loading = true;
    this.socialAuthService.loginWithFacebook()
      .subscribe({
        next: () => {
          this.notificationService.success('Facebook login successful');
          this.router.navigate(['/dashboard']);
        },
        error: (error: any) => {
          this.notificationService.error(error || 'Facebook login failed');
          this.loading = false;
        }
      });
  }
  
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
} 