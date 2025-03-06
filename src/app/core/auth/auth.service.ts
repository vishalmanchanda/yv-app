import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap, delay } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ConfigService } from '../services/config.service';
import { MfeCommunicationService } from '../events/mfe-communication.service';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  profileImage?: string;
  createdAt: string;
  phone?: string;
  bio?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  constructor(
    private http: HttpClient,
    private router: Router,
    private configService: ConfigService,
    private mfeCommunication: MfeCommunicationService
  ) {
    this.loadUserFromStorage();
    
    // Listen for auth events from MFEs
    this.mfeCommunication.on('auth-event').subscribe(event => {
      this.handleMfeAuthEvent(event.type, event.data);
    });
  }
  
  private loadUserFromStorage(): void {
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        this.currentUserSubject.next(user);
      } catch (e) {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
      }
    }
  }
  
  login(email: string, password: string, rememberMe: boolean = false): Observable<any> {
    // For demo purposes, accept specific credentials
    if (email === 'admin@example.com' && password === 'password123') {
      const user = {
        id: '1',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
        avatar: 'https://randomuser.me/api/portraits/men/10.jpg'
      };
      
      const token = 'mock-jwt-token-' + Math.random().toString(36).substring(2);
      
      // Store auth data
      this.setAuthState({
        user,
        token,
        isAuthenticated: true
      });
      
      // Store in localStorage if rememberMe is true
      if (rememberMe) {
        localStorage.setItem('auth', JSON.stringify({
          user,
          token,
          isAuthenticated: true
        }));
      }
      
      return of({ user, token }).pipe(delay(1000));
    }
    
    return throwError(() => 'Invalid email or password').pipe(delay(1000));
  }
  
  logout(): Observable<void> {
    const apiUrl = this.configService.getConfig().apiUrl;
    
    // For demo purposes, we'll use a mock logout
    // In a real app, you would use:
    // return this.http.post<void>(`${apiUrl}/auth/logout`, {})
    
    return of(void 0).pipe(
      tap(() => {
        // Clear user data
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
        this.currentUserSubject.next(null);
        
        // Notify MFEs about logout
        this.mfeCommunication.emit('auth-changed', { 
          isAuthenticated: false, 
          user: null 
        });
        
        // Navigate to login
        this.router.navigate(['/login']);
      })
    );
  }
  
  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }
  
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
  
  getCurrentUserId(): string | null {
    const user = this.currentUserSubject.value;
    return user ? user.id : null;
  }
  
  getToken(): string | null {
    return localStorage.getItem('token');
  }
  
  hasPermission(permission: string): boolean {
    const user = this.currentUserSubject.value;
    if (!user || !user.permissions) return false;
    
    return user.permissions.includes(permission);
  }
  
  updateUserProfile(profileData: Partial<User>): Observable<User> {
    const currentUser = this.currentUserSubject.value;
    if (!currentUser) {
      return throwError(() => new Error('No authenticated user'));
    }
    
    const apiUrl = this.configService.getConfig().apiUrl;
    
    // For demo purposes, we'll use a mock update
    // In a real app, you would use:
    // return this.http.patch<User>(`${apiUrl}/users/${currentUser.id}`, profileData)
    
    return of({
      ...currentUser,
      ...profileData,
      updatedAt: new Date().toISOString()
    }).pipe(
      tap(updatedUser => {
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        this.currentUserSubject.next(updatedUser);
        
        // Notify MFEs about user update
        this.mfeCommunication.emit('user-updated', updatedUser);
      })
    );
  }
  
  changePassword(currentPassword: string, newPassword: string): Observable<void> {
    const currentUser = this.currentUserSubject.value;
    if (!currentUser) {
      return throwError(() => new Error('No authenticated user'));
    }
    
    const apiUrl = this.configService.getConfig().apiUrl;
    
    // For demo purposes, we'll use a mock password change
    // In a real app, you would use:
    // return this.http.post<void>(`${apiUrl}/auth/change-password`, {
    //   currentPassword,
    //   newPassword
    // })
    
    return of(void 0).pipe(
      tap(() => {
        // Nothing to do for the mock implementation
      })
    );
  }
  
  // Method to be called by MFEs to check auth status
  getAuthState(): { isAuthenticated: boolean; user: User | null; token: string | null } {
    const user = this.currentUserSubject.value;
    const token = localStorage.getItem('token');
    return {
      isAuthenticated: !!user,
      user,
      token
    };
  }
  
  // Method to handle auth events from MFEs
  handleMfeAuthEvent(eventType: string, data: any): void {
    switch (eventType) {
      case 'logout':
        this.logout().subscribe();
        break;
      case 'refresh-token':
        // Implement token refresh logic
        break;
      case 'profile-updated':
        if (data && data.user) {
          this.currentUserSubject.next(data.user);
          localStorage.setItem('currentUser', JSON.stringify(data.user));
        }
        break;
    }
  }
  
  // Add this method to allow setting auth state from social login
  setAuthState(authState: any): void {
    this.currentUserSubject.next(authState.user);
    localStorage.setItem('currentUser', JSON.stringify(authState.user));
    localStorage.setItem('token', authState.token);
  }
} 