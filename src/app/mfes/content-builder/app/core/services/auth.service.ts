import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor() {}

  logout(): Observable<void | null> {
    return of(null);
  }
} 