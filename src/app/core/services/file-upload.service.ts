import { Injectable, Inject, Optional } from '@angular/core';
import { Observable, from, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private isStorageAvailable: boolean = false;

  constructor(@Optional() @Inject('Storage') private storage: any) {
    this.isStorageAvailable = !!this.storage;
    if (!this.isStorageAvailable) {
      console.warn('Firebase Storage is not available. File upload functionality will be limited.');
    }
  }

  /**
   * Upload a zip file to Firebase Storage
   * @param file The zip file to upload
   * @param path Optional custom path in storage (defaults to 'uploads/')
   * @returns Observable with upload progress and download URL
   */
  uploadZipFile(file: File, path = 'uploads/'): Observable<{
    progress: number, 
    downloadURL?: string
  }> {
    // Check if storage is available
    if (!this.isStorageAvailable) {
      console.warn('Attempted to upload file but Firebase Storage is not available');
      return throwError(() => new Error('Firebase Storage is not available'));
    }

    // Validate file type
    if (file.type !== 'application/zip' && 
        file.name.toLowerCase().indexOf('.zip') === -1) {
      return throwError(() => new Error('Invalid file type. Please upload a ZIP file.'));
    }

    try {
      // Import Firebase functions dynamically to avoid errors when Firebase is not configured
      const { ref, uploadBytesResumable, getDownloadURL } = require('@angular/fire/storage');

      // Generate unique filename
      const fileName = `${Date.now()}_${file.name}`;
      const storageRef = ref(this.storage, `${path}${fileName}`);

      // Create upload task
      const uploadTask = uploadBytesResumable(storageRef, file);

      return from(new Promise<{
        progress: number, 
        downloadURL?: string
      }>((resolve, reject) => {
        uploadTask.on('state_changed', 
          (snapshot: any) => {
            // Track upload progress
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`Upload is ${progress}% done`);
          },
          (error: any) => {
            // Handle unsuccessful uploads
            reject(error);
          },
          async () => {
            try {
              // Get download URL after successful upload
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve({
                progress: 100,
                downloadURL
              });
            } catch (error) {
              reject(error);
            }
          }
        );
      })).pipe(
        catchError(error => {
          console.error('Upload failed', error);
          return throwError(() => error);
        })
      );
    } catch (error) {
      console.error('Error setting up upload:', error);
      return throwError(() => error);
    }
  }

  async downloadFile(url: string): Promise<Blob> {
    if (!this.isStorageAvailable) {
      console.warn('Attempted to download file but Firebase Storage is not available');
      throw new Error('Firebase Storage is not available');
    }

    try {
      // Import Firebase functions dynamically
      const { ref, getDownloadURL } = require('@angular/fire/storage');
      
      const storageRef = ref(this.storage, url);
      const downloadUrl = await getDownloadURL(storageRef);
      
      const response = await fetch(downloadUrl, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/zip',
          'Content-Type': 'application/zip'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.blob();
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  }

  //download file from url as File
  async downloadZipFile(url: string, filename: string): Promise<File> {
    try {
      console.log('Downloading file from URL: ' + url);
      const blob = await this.downloadFile(url);
      console.log('File downloaded successfully');
      return new File([blob], filename, { type: 'application/zip' });
    } catch (error) {
      console.error('Error downloading zip file:', error);
      throw error;
    }
  }
}