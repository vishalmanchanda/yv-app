import { Injectable } from '@angular/core';

/**
 * Mock Storage service to replace Firebase Storage
 * This implementation allows components to load without Firebase dependency
 */
@Injectable({
  providedIn: 'root'
})
export class MockStorageService {
  constructor() {
    console.log('MockStorageService initialized as a Storage replacement');
  }
} 