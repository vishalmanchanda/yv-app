import { Injectable } from '@angular/core';
import JSZip from 'jszip'; 
import { StorageService } from '../../services/storage.service';

import { ContentMetadata, PartMetadata } from '../../../../core/models/content.models';



@Injectable({
  providedIn: 'root'
})
export class ZipService {
  constructor(
    private storageService: StorageService

  ) {}

  async importBookFromZip(file: File): Promise<string> {
    const zip = await JSZip.loadAsync(file);
    let bookId = '';

    // Clear existing images for this book
    await this.storageService.clearDatabase();

    const metaFile = zip.file('meta.json');
    if (metaFile) {
      const metaContent = await metaFile.async('string');
      const metadata: ContentMetadata = JSON.parse(metaContent);
      bookId = metadata.id;
      await this.storageService.clearDatabase();
      
      console.log('Book metadata:', metadata);
            
      this.storageService.storeMetadata(metadata);

      const chapterList: string[] = [];
      // Store chapter content
      const chapterFiles = Object.keys(zip.files).filter(name => /^\d+\.json$/.test(name));
      for (const chapterFile of chapterFiles) {
        const chapterContent = await zip.file(chapterFile)?.async('string');
        if (chapterContent) {
          const chapterNumber = chapterFile.split('.')[0];
          this.storageService.storePart(JSON.parse(chapterContent));
          chapterList.push(chapterNumber);
        }
      }

    }

    return bookId;
  }

 

  async exportBookAsZip(bookId: string): Promise<void> {
    const zip = new JSZip();
    const bookFolder = zip.folder(bookId);

    if (!bookFolder) {
      throw new Error('Failed to create book folder in zip');
    }

    const metadata = await this.storageService.getMetadata();
    if (metadata) {
      bookFolder.file('meta.json', JSON.stringify(metadata, null, 2));
    }

    const chapterList = (metadata?.partsMetadata || []).map((part: PartMetadata) => part.id);
    if (chapterList) {
      for (const id of chapterList) {
        const content = await this.storageService.getPart(id);
        bookFolder.file(`${id}.json`, JSON.stringify(content, null, 2));
      }
    }

    const content = await zip.generateAsync({ type: 'blob' });
    const fileName = `export_${bookId}_${this.getFormattedDateTime()}.zip`;
    this.saveAs(content, fileName);
  }

  private getFormattedDateTime(): string {
    const now = new Date();
    return now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
  }

  private saveAs(blob: Blob, fileName: string) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  async readZipFromURL(url: string): Promise<string> {
    await this.storageService.clearDatabase();
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const blob = await response.blob();
    const file = new File([blob], url.split('/').pop() || 'book.zip');
    return this.importBookFromZip(file);
  }

 
 
}
