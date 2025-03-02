import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { User, LoginCredentials } from './auth.models';
import { MockAuthService } from './mock-auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  private permissionsSubject = new BehaviorSubject<string[]>([]);
  permissions$ = this.permissionsSubject.asObservable();

  constructor(private mockAuthService: MockAuthService) {
    this.loadStoredUser();
  }

  private loadStoredUser() {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      const user = JSON.parse(storedUser);
      this.currentUserSubject.next(user);
      this.permissionsSubject.next(user.permissions);
    }
  }

  login(credentials: LoginCredentials): Observable<User> {
    return this.mockAuthService.login(credentials).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        this.currentUserSubject.next(response.user);
        this.permissionsSubject.next(response.user.permissions);
      }),
      map(response => response.user),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => new Error('Invalid credentials'));
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.permissionsSubject.next([]);
  }

  hasPermission(permission: string): boolean {
    const user = this.currentUserSubject.value;
    return user?.permissions.includes(permission) ?? false;
  }

  hasRole(role: string): boolean {
    const user = this.currentUserSubject.value;
    return user?.roles.includes(role) ?? false;
  }

  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }
} 