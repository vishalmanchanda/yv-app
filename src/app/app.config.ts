import { ApplicationConfig, isDevMode, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideEffects } from '@ngrx/effects';
import { provideRouterStore, routerReducer } from '@ngrx/router-store';
import { provideHttpClient } from '@angular/common/http';
import { MarkdownModule } from 'ngx-markdown';

import { routes } from './app.routes';
import { uiReducer } from './core/store/reducers/ui.reducer';

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
    })
  ]
};
