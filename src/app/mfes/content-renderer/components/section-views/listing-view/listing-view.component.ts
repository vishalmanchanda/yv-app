// TODO: Implement the listing view
// this component will be used to display a list of items
// and the items will be in the markdown format
// in the section.content field


import { Component, Input } from "@angular/core";
import { Section } from "../../../../../core/models/content.models";
import { BaseSectionViewComponent } from "../base-section-view.component";
import { ISectionViewComponent } from "../../../models/section-view.interface";
import { MarkdownModule } from "ngx-markdown";

@Component({
  selector: 'cr-listing-view',
  template: `
  <h3>{{ section.title }}</h3>
  <hr>
  <markdown [data]="section.content"></markdown>`,
  standalone: true,
  imports: [MarkdownModule],
})
export class ListingViewComponent extends BaseSectionViewComponent implements ISectionViewComponent {
  
}
