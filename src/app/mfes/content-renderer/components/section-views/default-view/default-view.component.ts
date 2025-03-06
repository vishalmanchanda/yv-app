import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarkdownModule } from 'ngx-markdown';

import { ISectionViewComponent } from '../../../models/section-view.interface';
import { ContentImageComponent } from "../../content-image/content-image.component";
import { BaseSectionViewComponent } from '../base-section-view.component';

@Component({
  selector: 'cr-default-view',
  standalone: true,
  imports: [CommonModule, MarkdownModule, ContentImageComponent],
  template: `
  <div class="section-view mb-5 pb-5">
    
  <h3 class="pb-1 px-3 pt-2">{{partTitle}}</h3>
  <hr *ngIf="showImages"/>
    <cr-content-image [partId]="partId" [sectionId]="section.id" *ngIf="showImages"></cr-content-image>
    <hr/>
    <h4 class="card-title pt-1 px-3"> {{section.title}} </h4>
    <hr/>
    <div class="default-view">    
      <!-- <div class="text-start px-3">
        <div [innerHTML]="section.passage"></div>
        
      </div>          -->
      <div class="commentary mt-4" *ngIf="section.commentary">
        <div class="card px-2">
          <div class="card-body">            
            <markdown [data]="section.commentary"></markdown>
          </div>
        </div>
        </div>        
        <div class="commentary text-start mt-4">
          <div class="p-3">
            <markdown [data]="section.content"></markdown>
          </div>
        </div>
      </div>
    </div>

  `,
  styleUrls: ['./default-view.component.scss']
})
export class DefaultViewComponent extends BaseSectionViewComponent implements ISectionViewComponent {

}