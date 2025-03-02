import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container">
      <div class="row">
        <div class="col-md-4">
          <div class="card profile-card">
            <div class="card-body text-center">
              <div class="avatar-container mb-3">
                <img [src]="profileImageUrl || 'assets/images/default-avatar.png'" 
                     alt="Profile Image" 
                     class="rounded-circle profile-image">
                <button class="btn btn-sm btn-primary change-photo-btn" (click)="triggerFileInput()">
                  <i class="bi bi-camera"></i>
                </button>
                <input type="file" #fileInput hidden (change)="onFileSelected($event)" accept="image/*">
              </div>
              <h4 class="card-title">{{ currentUser?.name }}</h4>
              <p class="card-text text-muted">{{ currentUser?.email }}</p>
              <p class="card-text">
                <span class="badge bg-primary">{{ currentUser?.role }}</span>
              </p>
              <p class="card-text">
                <small class="text-muted">Member since: {{ currentUser?.createdAt | date }}</small>
              </p>
            </div>
          </div>
        </div>
        
        <div class="col-md-8">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">Profile Information</h5>
            </div>
            <div class="card-body">
              <form [formGroup]="profileForm" (ngSubmit)="onSubmit()">
                <div class="mb-3">
                  <label for="name" class="form-label">Full Name</label>
                  <input type="text" class="form-control" id="name" formControlName="name">
                  <div *ngIf="profileForm.get('name')?.invalid && profileForm.get('name')?.touched" class="text-danger">
                    Name is required
                  </div>
                </div>
                
                <div class="mb-3">
                  <label for="email" class="form-label">Email</label>
                  <input type="email" class="form-control" id="email" formControlName="email">
                  <div *ngIf="profileForm.get('email')?.invalid && profileForm.get('email')?.touched" class="text-danger">
                    Please enter a valid email
                  </div>
                </div>
                
                <div class="mb-3">
                  <label for="phone" class="form-label">Phone Number</label>
                  <input type="tel" class="form-control" id="phone" formControlName="phone">
                </div>
                
                <div class="mb-3">
                  <label for="bio" class="form-label">Bio</label>
                  <textarea class="form-control" id="bio" rows="3" formControlName="bio"></textarea>
                </div>
                
                <button type="submit" class="btn btn-primary" [disabled]="profileForm.invalid || isSaving">
                  <span *ngIf="isSaving" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Save Changes
                </button>
              </form>
            </div>
          </div>
          
          <div class="card mt-4">
            <div class="card-header">
              <h5 class="mb-0">Change Password</h5>
            </div>
            <div class="card-body">
              <form [formGroup]="passwordForm" (ngSubmit)="onPasswordChange()">
                <div class="mb-3">
                  <label for="currentPassword" class="form-label">Current Password</label>
                  <input type="password" class="form-control" id="currentPassword" formControlName="currentPassword">
                  <div *ngIf="passwordForm.get('currentPassword')?.invalid && passwordForm.get('currentPassword')?.touched" class="text-danger">
                    Current password is required
                  </div>
                </div>
                
                <div class="mb-3">
                  <label for="newPassword" class="form-label">New Password</label>
                  <input type="password" class="form-control" id="newPassword" formControlName="newPassword">
                  <div *ngIf="passwordForm.get('newPassword')?.invalid && passwordForm.get('newPassword')?.touched" class="text-danger">
                    Password must be at least 8 characters
                  </div>
                </div>
                
                <div class="mb-3">
                  <label for="confirmPassword" class="form-label">Confirm New Password</label>
                  <input type="password" class="form-control" id="confirmPassword" formControlName="confirmPassword">
                  <div *ngIf="passwordForm.get('confirmPassword')?.invalid && passwordForm.get('confirmPassword')?.touched" class="text-danger">
                    Passwords do not match
                  </div>
                </div>
                
                <button type="submit" class="btn btn-primary" [disabled]="passwordForm.invalid || isChangingPassword">
                  <span *ngIf="isChangingPassword" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Update Password
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-card {
      margin-bottom: 1.5rem;
    }
    
    .avatar-container {
      position: relative;
      display: inline-block;
    }
    
    .profile-image {
      width: 120px;
      height: 120px;
      object-fit: cover;
      border: 3px solid var(--bs-primary);
    }
    
    .change-photo-btn {
      position: absolute;
      bottom: 0;
      right: 0;
      border-radius: 50%;
      width: 36px;
      height: 36px;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `]
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  currentUser: any;
  profileImageUrl: string | null = null;
  isSaving = false;
  isChangingPassword = false;
  
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}
  
  ngOnInit(): void {
    this.initForms();
    
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUser = user;
        this.profileImageUrl = user.profileImage || null;
        this.updateFormValues(user);
      }
    });
  }
  
  private initForms(): void {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      bio: ['']
    });
    
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }
  
  private updateFormValues(user: any): void {
    this.profileForm.patchValue({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      bio: user.bio || ''
    });
  }
  
  private passwordMatchValidator(form: FormGroup): { mismatch: boolean } | null {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    
    return newPassword === confirmPassword ? null : { mismatch: true };
  }
  
  triggerFileInput(): void {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fileInput.click();
  }
  
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const file = input.files[0];
      
      // Create a preview
      const reader = new FileReader();
      reader.onload = () => {
        this.profileImageUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
      
      // Upload the file
      this.uploadProfileImage(file);
    }
  }
  
  uploadProfileImage(file: File): void {
    // Implement file upload logic here
    // For example:
    // const formData = new FormData();
    // formData.append('profileImage', file);
    // this.userService.uploadProfileImage(formData).subscribe(...);
    
    // For now, just show a notification
    setTimeout(() => {
      this.notificationService.success('Profile image updated successfully');
    }, 1500);
  }
  
  onSubmit(): void {
    if (this.profileForm.invalid) return;
    
    this.isSaving = true;
    const profileData = this.profileForm.value;
    
    // Call your API to update the profile
    setTimeout(() => {
      // Mock API call
      this.isSaving = false;
      this.notificationService.success('Profile updated successfully');
    }, 1500);
  }
  
  onPasswordChange(): void {
    if (this.passwordForm.invalid) return;
    
    this.isChangingPassword = true;
    const passwordData = this.passwordForm.value;
    
    // Call your API to change the password
    setTimeout(() => {
      // Mock API call
      this.isChangingPassword = false;
      this.passwordForm.reset();
      this.notificationService.success('Password changed successfully');
    }, 1500);
  }
} 