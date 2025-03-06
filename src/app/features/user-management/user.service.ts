import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { User } from './user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private users: User[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'admin',
      active: true,
      createdAt: '2023-01-15T08:30:00Z',
      lastLogin: '2023-06-10T14:22:10Z'
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      role: 'manager',
      active: true,
      createdAt: '2023-02-20T10:15:00Z',
      lastLogin: '2023-06-09T09:45:30Z'
    },
    {
      id: '3',
      name: 'Bob Johnson',
      email: 'bob.johnson@example.com',
      role: 'user',
      active: true,
      createdAt: '2023-03-05T14:45:00Z',
      lastLogin: '2023-06-08T16:30:00Z'
    },
    {
      id: '4',
      name: 'Alice Williams',
      email: 'alice.williams@example.com',
      role: 'user',
      active: false,
      createdAt: '2023-04-12T09:20:00Z',
      lastLogin: '2023-05-20T11:10:45Z'
    },
    {
      id: '5',
      name: 'Charlie Brown',
      email: 'charlie.brown@example.com',
      role: 'manager',
      active: true,
      createdAt: '2023-05-18T13:10:00Z',
      lastLogin: '2023-06-07T08:55:20Z'
    }
  ];

  constructor() {}

  getUsers(): Observable<User[]> {
    // Simulate API delay
    return of([...this.users]).pipe(delay(500));
  }

  getUserById(id: string): Observable<User> {
    const user = this.users.find(u => u.id === id);
    if (user) {
      return of({...user}).pipe(delay(300));
    }
    return throwError(() => new Error('User not found'));
  }

  addUser(user: User): Observable<User> {
    // Generate a random ID
    const newUser = {
      ...user,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    this.users.push(newUser);
    return of(newUser).pipe(delay(500));
  }

  updateUser(user: User): Observable<User> {
    const index = this.users.findIndex(u => u.id === user.id);
    if (index !== -1) {
      this.users[index] = {...user};
      return of(this.users[index]).pipe(delay(500));
    }
    return throwError(() => new Error('User not found'));
  }

  deleteUser(id: string): Observable<void> {
    const index = this.users.findIndex(u => u.id === id);
    if (index !== -1) {
      this.users.splice(index, 1);
      return of(void 0).pipe(delay(500));
    }
    return throwError(() => new Error('User not found'));
  }
} 