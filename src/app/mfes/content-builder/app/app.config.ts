import { APP_INITIALIZER, ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';



import { provideAnimations } from '@angular/platform-browser/animations';

import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';



import { IndexedDbService } from './core/services/indexed-db.service';
import {NgbDropdown, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MarkdownModule } from 'ngx-markdown';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),

    provideAnimations(),

    provideHttpClient(),
    {
      provide: APP_INITIALIZER,
      useFactory: (indexedDB: IndexedDbService) => () => indexedDB.initDatabase(),
      deps: [IndexedDbService],
      multi: true
    },
    importProvidersFrom(
      MarkdownModule.forRoot()
    ),
    importProvidersFrom(  
      NgbDropdown
    ),
    NgbModal
  ]
};
