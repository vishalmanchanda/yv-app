import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

export interface MfeEvent {
  source: string;
  target: string | 'shell' | '*';
  type: string;
  payload: any;
}

@Injectable({
  providedIn: 'root'
})
export class MfeCommunicationService {
  private eventBus = new Subject<MfeEvent>();

  emit(type: string, payload: any, target: string | 'shell' | '*' = '*') {
    this.eventBus.next({
      source: 'shell',
      target,
      type,
      payload
    });
  }

  on(eventType: string, source?: string): Observable<any> {
    return this.eventBus.pipe(
      filter(event => {
        // Check if this event is for us (shell)
        const isForUs = event.target === 'shell' || event.target === '*';
        
        // Check if this is the event type we're looking for
        const isCorrectType = event.type === eventType;
        
        // Check if this is from the source we're interested in (if specified)
        const isFromSource = !source || event.source === source;
        
        return isForUs && isCorrectType && isFromSource;
      }),
      map(event => event.payload)
    );
  }

  // Method for MFEs to use
  fromMfe(source: string, type: string, payload: any, target: string | 'shell' | '*' = 'shell') {
    this.eventBus.next({
      source,
      target,
      type,
      payload
    });
  }
} 