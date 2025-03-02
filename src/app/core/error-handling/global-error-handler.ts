import { ErrorHandler, Injectable, NgZone } from '@angular/core';
import { NotificationService } from '../services/notification.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(
    private notificationService: NotificationService,
    private router: Router,
    private ngZone: NgZone
  ) {}

  handleError(error: Error) {
    console.error('An error occurred:', error);

    this.ngZone.run(() => {
      if (error.name === 'HttpErrorResponse') {
        // Handle HTTP errors
        const httpError = error as HttpErrorResponse;
        
        if (httpError.status === 401) {
          this.notificationService.error('Your session has expired. Please log in again.');
          this.router.navigate(['/login']);
        } else if (httpError.status === 403) {
          this.notificationService.error('You do not have permission to perform this action.');
        } else if (httpError.status === 404) {
          this.notificationService.error('The requested resource was not found.');
          this.router.navigate(['/404']);
        } else if (httpError.status >= 500) {
          this.notificationService.error('A server error occurred. Please try again later.');
          this.router.navigate(['/error'], { 
            queryParams: { code: httpError.status, message: httpError.message }
          });
        } else {
          this.notificationService.error('A network error occurred. Please try again.');
        }
      } else if (error instanceof TypeError) {
        // Handle runtime errors
        this.notificationService.error('An application error occurred.');
        this.router.navigate(['/error'], { 
          queryParams: { message: 'An unexpected error occurred.' }
        });
      } else {
        // Handle other errors
        this.notificationService.error('Something went wrong.');
      }
      
      // Log to monitoring service (e.g., Sentry)
      // this.loggingService.logError(error);
    });
  }
} 