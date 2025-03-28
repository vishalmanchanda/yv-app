import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';



import { ContentBrowserModule } from './features/content-browser/content-browser.module';


import { routes } from './app.routes';
import { ModalComponent } from '../../content-renderer/shared/components/modal/modal.component';
import { ToastComponent } from '../../content-renderer/shared/components/toast/toast.component';
import { FirebaseModule } from './firebase.module';
import { CoreModule } from '../../../core/core.module';




@NgModule({
  declarations: [

  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule,
    AppRoutingModule,
    CoreModule,
    ModalComponent,
    ToastComponent,
    ContentBrowserModule,
    RouterModule.forRoot(routes),
    NgbModule,
    FirebaseModule
    
  ],
  providers: [AppComponent],
  bootstrap: []
})
export class AppModule { } 