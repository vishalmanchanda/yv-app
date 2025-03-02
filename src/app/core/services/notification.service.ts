import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  title?: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new Subject<Notification>();
  private removeNotificationSubject = new Subject<string>();

  notifications$ = this.notificationsSubject.asObservable();
  removeNotification$ = this.removeNotificationSubject.asObservable();

  show(type: NotificationType, message: string, title?: string, duration: number = 5000) {
    const id = this.generateId();
    this.notificationsSubject.next({
      id,
      type,
      message,
      title,
      duration
    });

    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }
  }

  success(message: string, title?: string) {
    this.show('success', message, title);
  }

  error(message: string, title?: string) {
    this.show('error', message, title);
  }

  warning(message: string, title?: string) {
    this.show('warning', message, title);
  }

  info(message: string, title?: string) {
    this.show('info', message, title);
  }

  remove(id: string) {
    this.removeNotificationSubject.next(id);
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 9);
  }
} 