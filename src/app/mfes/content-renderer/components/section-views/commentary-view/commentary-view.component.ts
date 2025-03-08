import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarkdownModule } from 'ngx-markdown';
import { CommentaryService } from '../../../services/commentary.service';


import { NgbModal, NgbModalModule, NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';
import { AuthorStateService } from '../../../services/author-state.service';
import { Author } from '../../../../../core/models/content.models';
import { TruncatePipe } from "../../../core/utils/string-utils";

@Component({
  selector: 'cr-commentary-view',
  standalone: true,
  imports: [CommonModule, MarkdownModule, NgbModalModule, NgbCarouselModule, TruncatePipe],
  template: `      
       <!-- Previous content remains same until commentary section -->
    <div class="commentary-content card px-1" *ngIf="authors && authors.length > 0">
      <div class="card-body">
        <div class="commentary-header d-flex align-items-center" 
        (click)="openAuthorSelection(authorSelectionModal)"
        tabindex="0"
        (keydown.enter)="openAuthorSelection(authorSelectionModal)">
          <div class="author-image">
            <img [src]="currentAuthor?.image" [alt]="currentAuthor?.name" 
                 class="rounded-circle" width="50" height="50">
          </div>
          <div class="author-info ms-3">
            <small class="text-muted fs-6">Commentary by </small>
            <h5 class="mb-0">{{currentAuthor?.name}}</h5>
            <small class="text-muted fs-6 text fst-italic mt-0 mb-0">Tap to change author</small>
          </div>
        </div>
        <hr>
        <markdown [data]="authorCommentary" class="text-break text-muted"></markdown>
      </div>
    </div>
    <!-- <div class="commentary-content card px-1" *ngIf="!authorCommentary && section.commentary">
      <div class="card-body">
        <markdown [data]="section.commentary"></markdown>
      </div>
    </div> -->
   

   <!-- Author Selection Modal Template -->
<ng-template #authorSelectionModal>
  <div class ="container">
  <div class="modal-header border-0 pb-0">
    <h4 class="modal-title">Select Commentary</h4>
    <button type="button" class="btn-close" (click)="modalRef.dismiss()"
    tabindex="0"
    (keydown.enter)="modalRef.dismiss()"> </button>
  </div>
  <div class="modal-body pt-2">
    <div class="author-grid">
      <div class="author-card" *ngFor="let author of authors"
           [class.active]="author.id === currentAuthor?.id"
           (click)="selectAuthor(author)"
           tabindex="0"
           (keydown.enter)="selectAuthor(author)">
        <img [src]="author.image" [alt]="author.name" class="rounded-circle">
        <h5 class="mt-3">{{author.name}}</h5>
        <p class="text-muted" *ngIf="author.bio">{{author.bio | truncate : 100}}</p>
      </div>
    </div>
  </div>
</div>
</ng-template>
  `,
  styleUrls: ['./commentary-view.component.scss']
})
export class CommentaryViewComponent implements OnInit, OnChanges {
  // @Input() section!: Section;
  // @Input() partId!: string;
  // @Input() contentId!: string;
  @Input() authors: Author[] = [];
  @Input() authorCommentary: string = '' as string;
  @Input() currentAuthor?: Author;
  @Output() authorSelected = new EventEmitter<Author>();
  modalRef: any;


  constructor(
    private commentaryService: CommentaryService,
    private modalService: NgbModal,
    private authorStateService: AuthorStateService
  ) {
  }
  
  async ngOnInit() {
    this.authors =  await this.commentaryService.getAuthors();
  }
  openAuthorSelection(modal: any) {
    this.modalRef = this.modalService.open(modal, {      
      windowClass: 'author-selection-modal',
      size: 'xl',
      fullscreen: true,
      scrollable: true,
      centered: false
    });
  }


  async selectAuthor(author: Author) {
    this.authorSelected.emit(author);
    this.currentAuthor = author;
    this.modalRef.close();
  }

  
  ngOnChanges() {
    console.log('authors', this.authors);
  }

  handleImageError(event: any) {
    event.target.style.display = 'none';
  }
  
}


