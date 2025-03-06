

import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ContentService } from '../../services/content.service';

@Component({
  selector: 'cr-content-image',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './content-image.component.html',
  styleUrls: ['./content-image.component.scss']
})
export class ContentImageComponent implements OnInit{
  @Input() partId = '1'; 
  @Input() sectionId = '1';
  @Input() height?: string;
  @Input() width?: string;

  imageSrc = '';

  constructor(private contentService: ContentService) {}

  ngOnInit() {  
    this.loadImage();
  }

  async loadImage() {
    const imageKey = await this.buildImageKey();  
  //  if (imageKey) {
      this.imageSrc = await this.contentService.getImageUrl(imageKey!);
    // } else{
    //   this.imageSrc = await this.contentService.getCoverImageUrl();
    // }
  }

  async buildImageKey(): Promise<string | null> {
    let imageKey = null;
    let hasImage = false;
    if (this.partId && this.sectionId) {
      imageKey = this.partId + '/section'+this.sectionId + '.jpg';
      hasImage = await this.contentService.hasImage(imageKey);
      if (hasImage) {
        return imageKey;
      }
    } else if (this.partId) {
      imageKey = this.partId + '.jpg';
      hasImage = await this.contentService.hasImage(imageKey);
      if (hasImage) {
        return imageKey;
      }
    } else{
      imageKey = 'bookCover.jpg';
      hasImage = await this.contentService.hasImage(imageKey);
      if (hasImage) {
        return imageKey;
      } 
    }
    return imageKey;
  }
}
