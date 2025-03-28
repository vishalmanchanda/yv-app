import { NgModule } from '@angular/core';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideStorage, getStorage } from '@angular/fire/storage';
import { environment } from '../environments/environment';
import { FileUploadService } from '../../../core/services/file-upload.service';


@NgModule({
  imports: [
    
  ],
  providers: [
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideStorage(() => getStorage()),
    FileUploadService
  ]
})
export class FirebaseModule { }