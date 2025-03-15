import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';


import { AppComponent } from './app.component';

import { SettingsComponent } from './components/settings/settings.component';

import { environment } from '../environments/environment';

import { FirebaseModule } from './firebase.module';
import { SearchComponent } from '../../content-renderer/components/search/search.component';
import { ModalComponent } from '../../content-renderer/shared/components/modal/modal.component';
import { ToastComponent } from '../../content-renderer/shared/components/toast/toast.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { initializeApp } from '@angular/fire/app';
import { provideFirebaseApp } from '@angular/fire/app';
// import { environment } from '../../../../environments/environment';



@NgModule({
  declarations: [


  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    SettingsComponent,
    SearchComponent,
    ModalComponent,
    ToastComponent,   
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      registrationStrategy: 'registerWhenStable:30000'
    }),
    FirebaseModule,    
  ],
  providers: [AppComponent,
    {
      provide: 'AUDIO_BASE_URL',
      useValue: 'https://vishalmanchanda.github.io/assets/gita_shloka_chants' // Replace with your actual base URL
    }
  
  ],
  bootstrap: []
})
export class AppModule { } 