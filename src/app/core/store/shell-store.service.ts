import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ShellStoreService {
  private state = new BehaviorSubject<any>({});
  state$ = this.state.asObservable();

  setState(key: string, value: any) {
    const currentState = this.state.value;
    this.state.next({ ...currentState, [key]: value });
  }

  getState(key: string) {
    return this.state.value[key];
  }
} 