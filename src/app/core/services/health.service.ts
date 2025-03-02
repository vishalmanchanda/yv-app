import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timer, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { ConfigService } from './config.service';

export interface HealthStatus {
  status: 'up' | 'down' | 'degraded';
  version: string;
  timestamp: number;
  services: {
    [key: string]: {
      status: 'up' | 'down';
      responseTime?: number;
      message?: string;
    }
  };
}

@Injectable({
  providedIn: 'root'
})
export class HealthService {
  private appVersion = '1.0.0'; // Should come from environment
  
  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {}

  getAppVersion(): string {
    return this.appVersion;
  }

  checkHealth(): Observable<HealthStatus> {
    const apiUrl = this.configService.getConfig().apiUrl;
    
    return this.http.get<HealthStatus>(`${apiUrl}/health`).pipe(
      map(response => ({
        status: response.status || 'up',
        version: this.appVersion,
        timestamp: Date.now(),
        services: response.services || {}
      })),
      catchError(error => {
        return of({
          status: 'down' as 'up' | 'down' | 'degraded',
          version: this.appVersion,
          timestamp: Date.now(),
          services: {
            api: {
              status: 'down' as 'up' | 'down',
              message: error.message
            }
          }
        });
      })
    );
  }

  startHealthMonitoring(interval = 60000): Observable<HealthStatus> {
    return timer(0, interval).pipe(
      switchMap(() => this.checkHealth())
    );
  }

  checkMfeHealth(mfeName: string): Observable<boolean> {
    const mfeUrl = this.configService.getMfeUrl(mfeName);
    
    return this.http.get(`${mfeUrl}/health`).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }
} 