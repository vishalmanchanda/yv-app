import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private visibilitySubject = new BehaviorSubject<boolean>(false);
  public visibility$ = this.visibilitySubject.asObservable();
  
  constructor() {}
  
  show(): void {
    this.visibilitySubject.next(true);
  }
  
  hide(): void {
    this.visibilitySubject.next(false);
  }
  
  toggle(): void {
    this.visibilitySubject.next(!this.visibilitySubject.value);
  }
  
  isVisible(): boolean {
    return this.visibilitySubject.value;
  }
} 