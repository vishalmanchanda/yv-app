import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface LoadingState {
  show: boolean;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  private loadingSubject = new BehaviorSubject<LoadingState>({ show: false });
  loading$ = this.loadingSubject.asObservable();

  private requestCount = 0;

  show(message: string = 'Loading...') {
    this.requestCount++;
    this.loadingSubject.next({ show: true, message });
  }

  hide() {
    this.requestCount--;
    if (this.requestCount <= 0) {
      this.requestCount = 0;
      this.loadingSubject.next({ show: false });
    }
  }

  forceHide() {
    this.requestCount = 0;
    this.loadingSubject.next({ show: false });
  }
} 