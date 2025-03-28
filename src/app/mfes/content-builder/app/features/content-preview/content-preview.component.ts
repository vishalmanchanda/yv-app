// create a component that will preview the content 
// it will recieve contentId as input
// and will read the content from content-builder-db for that contentId
// and will copy that to content-viewer-db using the storage service of the content-renderer
// and will redirect to /renderer/:id   


import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../core/services/toast.service';

import { CommonModule } from '@angular/common';
import { MarkdownModule } from 'ngx-markdown';
import { ContentBuilderService } from '../../core/services/content-builder.service';
import { ReaderComponent } from '../../../../content-renderer/components/reader/reader.component';

@Component({
  standalone: true,
  imports: [CommonModule, ReaderComponent, MarkdownModule],
  selector: 'app-content-preview',
  template: `<cr-reader *ngIf="contentId && previewReady"></cr-reader>`,
  styles: [``]
})
export class ContentPreviewComponent implements OnInit {
    @Input() contentId!: string;
      previewReady = false;

  constructor(
    private contentBuilderService: ContentBuilderService, 
    private routes: ActivatedRoute,
    private router: Router, private toastr: ToastService) {}

  async ngOnInit(): Promise<void> {

    this.routes.params.subscribe(params => {
      this.contentId = params['id'];
    });

    this.previewReady = await this.contentBuilderService.isReadyForPreview(this.contentId);
    if(!this.previewReady){
      this.toastr.show('Oops!', 'Something went wrong');
    }
  }
}
