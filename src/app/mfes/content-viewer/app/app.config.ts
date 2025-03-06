import { ApplicationConfig, provideZoneChangeDetection, isDevMode, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { provideServiceWorker } from '@angular/service-worker';
import { NgbModal  } from '@ng-bootstrap/ng-bootstrap';
import { MarkdownModule } from 'ngx-markdown';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes), 
    provideHttpClient(),
    importProvidersFrom(
      MarkdownModule.forRoot()
    ),
    NgbModal,
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerImmediately'
    }), provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000'
          })
  ]
};
