import { ApplicationConfig, isDevMode, importProvidersFrom, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideEffects } from '@ngrx/effects';
import { provideRouterStore, routerReducer } from '@ngrx/router-store';
import { provideHttpClient } from '@angular/common/http';
import { MarkdownModule } from 'ngx-markdown';
import { Router } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';

import { routes } from './app.routes';
import { uiReducer } from './core/store/reducers/ui.reducer';
import { MockStorageService } from './core/services/mock-storage.service';

// Factory function to provide the Storage token
export function storageFactory() {
  // Empty implementation object that satisfies the minimal interface needed
  return {
    // Stub methods needed by the FileUploadService
    _delegate: {},
    app: { name: 'mock-app' }
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    importProvidersFrom(
      MarkdownModule.forRoot()
    ),
    provideStore({
      router: routerReducer,
      ui: uiReducer
    }),
    provideEffects(),
    provideRouterStore(),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
      autoPause: true,
      trace: false,
      traceLimit: 75,
    }),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }),
    // Provide Storage token with a factory function
    {
      provide: 'Storage',
      useFactory: storageFactory
    },
    {
      provide: APP_INITIALIZER,
      useFactory: (router: Router) => {
        return () => {
          if (window.location.pathname !== '/' && 
              window.location.pathname !== '/index.html') {
            router.initialNavigation();
          }
        };
      },
      deps: [Router],
      multi: true
    }
  ]
};
