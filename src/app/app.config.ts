import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { CoreModule } from './core/core.module';
import { ConfigService } from './core/services/config.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    importProvidersFrom(CoreModule),
    {
      provide: 'APP_INITIALIZER',
      useFactory: (configService: ConfigService) => {
        return () => configService.loadConfig();
      },
      deps: [ConfigService],
      multi: true
    }
  ]
};
