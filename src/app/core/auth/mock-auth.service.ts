import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { User, LoginCredentials, AuthResponse } from './auth.models';

const MOCK_USER: User = {
  id: '1',
  email: 'admin@example.com',
  name: 'Admin User',
  roles: ['admin'],
  permissions: ['read', 'write', 'admin']
};

const MOCK_CREDENTIALS = {
  email: 'admin@example.com',
  password: 'admin123'
};

@Injectable({
  providedIn: 'root'
})
export class MockAuthService {
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    // Simulate API delay
    if (credentials.email === MOCK_CREDENTIALS.email && 
        credentials.password === MOCK_CREDENTIALS.password) {
      return of({
        user: MOCK_USER,
        token: 'mock-jwt-token'
      }).pipe(delay(1000)); // Simulate network delay
    }

    return throwError(() => new Error('Invalid credentials')).pipe(delay(1000));
  }
} 