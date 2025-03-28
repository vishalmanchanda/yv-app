import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ModalConfig {
  title: string;
  body: string;
  confirmText?: string;
  cancelText?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modalSubject = new Subject<ModalConfig | null>();
  modalState$ = this.modalSubject.asObservable();

  open(config: ModalConfig): Promise<boolean> {
    return new Promise((resolve) => {
      const subscription = this.modalState$.subscribe((result) => {
        if (result === null) {
          resolve(false);
          subscription.unsubscribe();
        }
      });

      this.modalSubject.next(config);

      const confirmSubscription = this.modalState$.subscribe((result) => {
        if (result && result.confirmText) {
          resolve(true);
          confirmSubscription.unsubscribe();
        }
      });
    });
  }

  close() {
    this.modalSubject.next(null);
  }

  confirm() {
    this.modalSubject.next({ title: '', body: '', confirmText: 'confirm' });
  }
}
