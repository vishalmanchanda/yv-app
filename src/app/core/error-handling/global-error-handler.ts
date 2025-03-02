import { ErrorHandler, Injectable, NgZone } from '@angular/core';
import { NotificationService } from '../services/notification.service';
import { Router } from '@angular/router';

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
        this.notificationService.error('A network error occurred. Please try again.');
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
    });
  }
} 