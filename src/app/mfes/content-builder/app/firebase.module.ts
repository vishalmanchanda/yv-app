import { NgModule } from '@angular/core';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideStorage, getStorage } from '@angular/fire/storage';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { environment } from '../../content-viewer/environments/environment';
import { FileUploadService } from '../../../core/services/file-upload.service';



@NgModule({
  imports: [],
  providers: [
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideStorage(() => getStorage()),
    provideAuth(() => getAuth()),
    FileUploadService
  ]
})
export class FirebaseModule { }