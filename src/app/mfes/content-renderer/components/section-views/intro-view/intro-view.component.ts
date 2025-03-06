import { Component, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarkdownModule } from 'ngx-markdown';

import { ISectionViewComponent } from '../../../models/section-view.interface';
import { BaseSectionViewComponent } from '../base-section-view.component';
import { ContentImageComponent } from "../../content-image/content-image.component";
import { ContentService } from '../../../services/content.service';
import { SectionViewService } from '../../../services/section-view.service';
import { TruncatePipe } from "../../../core/utils/string-utils";



@Component({
  selector: 'cr-intro-view',
  standalone: true,
  imports: [CommonModule, MarkdownModule, ContentImageComponent, TruncatePipe],
  template: `
    <div class="intro-view mb-5 pb-5">
      <!-- Background Image with Fallback -->
      <div class="background-image w-100 h-100">
        <img 
          [src]="imageUrl" 
          (error)="handleImageError($event)" 
          class="w-100 h-100 object-fit-cover"
          alt="Section background"
        >
        <!-- <cr-content-image [partId]="partId" [sectionId]="section.id" [height]="'100vh'" [width]="'100%'"></cr-content-image> -->
      </div>

      <!-- Content Overlay -->
      <div class="content-overlay position-absolute top-0 start-0 w-100 h-100 d-flex align-items-end pb-5 opacity-75">
        <div class="content-wrapper p-4 p-md-5 w-100 ">
          <!-- Hierarchical Titles -->
          <div class="title-container">
            <div class="content-title mb-2" *ngIf="contentTitle">
              {{ contentTitle }}
            </div>
            <div class="part-title mb-2 lead" *ngIf="partTitle">
              {{ partTitle }}
            </div>
            <h5 class="section-title">
              {{ section.title }}
            </h5>
            <hr>
            <!-- make the markdown render in a scrollable div -->
            <div class="markdown-container">
              <markdown [data]="section.content"></markdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
    }

    .intro-view {
      overflow: hidden;
    }

    .background-image {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 1;
    }

    .markdown-container {
      max-height: 300px;
      overflow-y: auto;
    }

    .content-overlay {
      background: linear-gradient(
        0deg,
        rgba(0, 0, 0, 0.8) 0%,
        rgba(0, 0, 0, 0.4) 50%,
        rgba(0, 0, 0, 0.1) 100%
      );
      z-index: 2;
    }

    .content-wrapper {
      background: rgba(0, 0, 0, 0.9);
      backdrop-filter: blur(5px);
      border-radius: 8px;
      max-width: 800px;
      margin: 0 auto;
      opacity: 1;
      margin-bottom: 20px;
    }

    .title-container {
      color: white;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    }

    .content-title {
      font-size: 1rem;
      text-transform: uppercase;
      letter-spacing: 2px;
      opacity: 0.8;
    }

    .part-title {
      font-size: 2.5rem;
      font-weight: 500;
    }

    .section-title {
      font-weight: 700;
      line-height: 1.2;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .content-wrapper {
        background: rgba(0, 0, 0, 0.8);
      }

      .section-title {
        font-size: 1.25rem;
      }

      .content-title {
        font-size: 0.875rem;
      }

      .part-title {
        font-size: 1.75rem;
      }
    }
  `]
})
export class IntroViewComponent extends BaseSectionViewComponent implements ISectionViewComponent, OnInit {

  defaultImageUrl = 'assets/images/default.jpg';

  constructor(
    sectionViewService: SectionViewService,
    contentService: ContentService,
    elementRef: ElementRef
  ) {
    super(sectionViewService, contentService, elementRef);  
  }
  

  override async ngOnInit() {
    super.ngOnInit(); 
    // this.imageUrl = this.contentService.getFallbackImageUrl('intro');
    
    const imageKey =  await this.contentService.buildImageKey(this.partId, this.section.id);
    if (imageKey && imageKey !== null) {
      this.imageUrl = await this.contentService.getImageUrl(imageKey);
    }
  }
  

  handleImageError(event: any) {
    // If section image fails, try part image   
      this.imageUrl = this.defaultImageUrl;    
  }

  

} 
