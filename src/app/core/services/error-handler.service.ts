import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  handleError(error: Error | HttpErrorResponse) {
    // Log to monitoring service
    console.error('Error:', error);
    
    // Show user-friendly message
    // Implement toast or notification
  }
} 