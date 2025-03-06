import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from './user.service';
import { User } from './user.model';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mt-4">
      <div class="row mb-4">
        <div class="col">
          <h2>User Management</h2>
          <p class="text-muted">Manage system users and their permissions</p>
        </div>
        <div class="col-auto">
          <button class="btn btn-primary" (click)="showAddUserForm()">
            <i class="bi bi-person-plus"></i> Add User
          </button>
        </div>
      </div>

      <!-- User Form -->
      <div class="row mb-4" *ngIf="showForm">
        <div class="col-md-6">
          <div class="card">
            <div class="card-header">
              {{ editMode ? 'Edit User' : 'Add New User' }}
            </div>
            <div class="card-body">
              <form (ngSubmit)="saveUser()">
                <div class="mb-3">
                  <label for="name" class="form-label">Name</label>
                  <input type="text" class="form-control" id="name" [(ngModel)]="currentUser.name" name="name" required>
                </div>
                <div class="mb-3">
                  <label for="email" class="form-label">Email</label>
                  <input type="email" class="form-control" id="email" [(ngModel)]="currentUser.email" name="email" required>
                </div>
                <div class="mb-3">
                  <label for="role" class="form-label">Role</label>
                  <select class="form-select" id="role" [(ngModel)]="currentUser.role" name="role" required>
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="user">User</option>
                  </select>
                </div>
                <div class="mb-3 form-check">
                  <input type="checkbox" class="form-check-input" id="active" [(ngModel)]="currentUser.active" name="active">
                  <label class="form-check-label" for="active">Active</label>
                </div>
                <div class="d-flex gap-2">
                  <button type="submit" class="btn btn-primary">Save</button>
                  <button type="button" class="btn btn-secondary" (click)="cancelEdit()">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- Users Table -->
      <div class="card">
        <div class="card-header">
          <div class="row align-items-center">
            <div class="col">
              <h5 class="mb-0">Users</h5>
            </div>
            <div class="col-auto">
              <input 
                type="text" 
                class="form-control form-control-sm" 
                placeholder="Search users..." 
                [(ngModel)]="searchTerm"
                (input)="filterUsers()">
            </div>
          </div>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let user of filteredUsers">
                  <td>{{ user.name }}</td>
                  <td>{{ user.email }}</td>
                  <td>
                    <span class="badge" [ngClass]="{
                      'bg-danger': user.role === 'admin',
                      'bg-warning': user.role === 'manager',
                      'bg-info': user.role === 'user'
                    }">{{ user.role }}</span>
                  </td>
                  <td>
                    <span class="badge" [ngClass]="user.active ? 'bg-success' : 'bg-secondary'">
                      {{ user.active ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td>
                    <div class="btn-group btn-group-sm">
                      <button class="btn btn-outline-primary" (click)="editUser(user)">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button class="btn btn-outline-danger" (click)="deleteUser(user.id)">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr *ngIf="filteredUsers.length === 0">
                  <td colspan="5" class="text-center py-3">No users found</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="card-footer">
          <small class="text-muted">Total users: {{ users.length }}</small>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .table th, .table td {
      padding: 0.75rem 1rem;
      vertical-align: middle;
    }
  `]
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  currentUser: User = this.getEmptyUser();
  showForm = false;
  editMode = false;
  searchTerm = '';

  constructor(
    private userService: UserService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe(users => {
      this.users = users;
      this.filterUsers();
    });
  }

  filterUsers(): void {
    if (!this.searchTerm) {
      this.filteredUsers = [...this.users];
      return;
    }
    
    const term = this.searchTerm.toLowerCase();
    this.filteredUsers = this.users.filter(user => 
      user.name.toLowerCase().includes(term) || 
      user.email.toLowerCase().includes(term) ||
      user.role.toLowerCase().includes(term)
    );
  }

  showAddUserForm(): void {
    this.currentUser = this.getEmptyUser();
    this.editMode = false;
    this.showForm = true;
  }

  editUser(user: User): void {
    this.currentUser = { ...user };
    this.editMode = true;
    this.showForm = true;
  }

  saveUser(): void {
    if (this.editMode) {
      this.userService.updateUser(this.currentUser).subscribe({
        next: () => {
          this.notificationService.success('User updated successfully');
          this.loadUsers();
          this.cancelEdit();
        },
        error: (err) => {
          this.notificationService.error('Failed to update user');
          console.error(err);
        }
      });
    } else {
      this.userService.addUser(this.currentUser).subscribe({
        next: () => {
          this.notificationService.success('User added successfully');
          this.loadUsers();
          this.cancelEdit();
        },
        error: (err) => {
          this.notificationService.error('Failed to add user');
          console.error(err);
        }
      });
    }
  }

  deleteUser(id: string): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(id).subscribe({
        next: () => {
          this.notificationService.success('User deleted successfully');
          this.loadUsers();
        },
        error: (err) => {
          this.notificationService.error('Failed to delete user');
          console.error(err);
        }
      });
    }
  }

  cancelEdit(): void {
    this.showForm = false;
    this.currentUser = this.getEmptyUser();
  }

  private getEmptyUser(): User {
    return {
      id: '',
      name: '',
      email: '',
      role: 'user',
      active: true,
      createdAt: new Date().toISOString()
    };
  }
} 