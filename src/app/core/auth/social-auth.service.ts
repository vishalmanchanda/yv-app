import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class SocialAuthService {
  private readonly MOCK_DELAY = 1000; // Simulate network delay
  
  constructor(private authService: AuthService) {}
  
  /**
   * Simulates Google OAuth login
   */
  loginWithGoogle(): Observable<any> {
    // Simulate successful login 90% of the time
    if (Math.random() < 0.9) {
      return of({
        user: {
          id: 'google-user-123',
          name: 'John Google',
          email: 'john.google@example.com',
          picture: 'https://randomuser.me/api/portraits/men/1.jpg'
        },
        token: 'google-mock-jwt-token-' + Math.random().toString(36).substring(2)
      }).pipe(
        delay(this.MOCK_DELAY),
        // Update the auth service with the user info
        tap(response => {
          this.authService.setAuthState({
            user: {
              id: response.user.id,
              name: response.user.name,
              email: response.user.email,
              avatar: response.user.picture,
              role: 'user'
            },
            token: response.token,
            isAuthenticated: true
          });
        })
      );
    } else {
      // Simulate login failure
      return throwError(() => 'Google authentication failed. Please try again.').pipe(
        delay(this.MOCK_DELAY)
      );
    }
  }
  
  /**
   * Simulates Facebook OAuth login
   */
  loginWithFacebook(): Observable<any> {
    // Simulate successful login 90% of the time
    if (Math.random() < 0.9) {
      return of({
        user: {
          id: 'fb-user-456',
          name: 'Jane Facebook',
          email: 'jane.facebook@example.com',
          picture: 'https://randomuser.me/api/portraits/women/1.jpg'
        },
        token: 'facebook-mock-jwt-token-' + Math.random().toString(36).substring(2)
      }).pipe(
        delay(this.MOCK_DELAY),
        // Update the auth service with the user info
        tap(response => {
          this.authService.setAuthState({
            user: {
              id: response.user.id,
              name: response.user.name,
              email: response.user.email,
              avatar: response.user.picture,
              role: 'user'
            },
            token: response.token,
            isAuthenticated: true
          });
        })
      );
    } else {
      // Simulate login failure
      return throwError(() => 'Facebook authentication failed. Please try again.').pipe(
        delay(this.MOCK_DELAY)
      );
    }
  }
} 