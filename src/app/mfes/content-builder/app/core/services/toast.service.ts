import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ToastInfo {
  header: string;
  body: string;
  className?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toastEvents: Subject<ToastInfo> = new Subject<ToastInfo>();

  show(header: string, body: string, className: string = '') {
    this.toastEvents.next({ header, body, className });
  }
}
