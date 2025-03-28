import { Injectable } from '@angular/core';
import  JSZip from 'jszip';
import { Part } from '../../../../../core/models/content.models';
import { ContentMetadata } from '../../../../../core/models/content.models';


export interface ImportResult {
  metadata: ContentMetadata;
  parts: Part[];
  images?: Record<string, Blob>;
}

@Injectable({
  providedIn: 'root'
})
export class ZipHandlerService {
  async importZip(file: File): Promise<{ metadata: ContentMetadata; parts: Part[] }> {
    const zip = await JSZip.loadAsync(file);
    const parts: Part[] = [];
    
    // Read metadata.json first
    const metadataFile = zip.file('meta.json');
    if (!metadataFile) {
      throw new Error('Invalid content package: meta.json not found');
    }
    
    const metadata: ContentMetadata = JSON.parse(
      await metadataFile.async('text')
    );
    
    // Read all part files
    for (const partMeta of metadata.partsMetadata) {
      const partFile = zip.file(`${partMeta.id}.json`);
      if (partFile) {
        const partContent = await partFile.async('text');
        const part: Part = JSON.parse(partContent);
        parts.push(part);
      }
    }
    
    return { metadata, parts };
  }

  async exportZip(content: any): Promise<Blob> {
    const zip = new JSZip();
    
    // Add meta.json without pretty printing
    zip.file('meta.json', JSON.stringify(content.metadata));
    
    // Add part files without pretty printing
    content.parts.forEach((part: any) => {
      zip.file(`${part.id}.json`, JSON.stringify(part));
    });

    // Add images
    const images = await this.extractImages(zip);
    for (const [filename, data] of Object.entries(images)) {
      zip.file(filename, data as Blob);
    }
    
    // Generate zip with compression
    return await zip.generateAsync({ 
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 9 // Maximum compression
      }
    });
  }

  private async extractImages(contents: JSZip): Promise<Record<string, Blob>> {
    const images: Record<string, Blob> = {};
    const imagesFolder = contents.folder('images');
    
    if (imagesFolder) {
      const imageFiles = imagesFolder.filter((path: string) => 
        /\.(jpg|jpeg|png|gif)$/i.test(path)
      );
      
      for (const file of imageFiles) {
        const blob = await file.async('blob');
        images[file.name] = blob;
      }
    }
    
    return images;
  }

  async createZip(content: any): Promise<Blob> {
    return await this.exportZip(content);
  }


} 