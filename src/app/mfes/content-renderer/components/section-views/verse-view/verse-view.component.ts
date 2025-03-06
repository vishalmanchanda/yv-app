import { AfterViewInit, Component, ElementRef, OnChanges, OnInit, ViewChild, HostListener, Inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarkdownModule } from 'ngx-markdown';
import { DomSanitizer } from '@angular/platform-browser';



import { PassageParser } from '../../reader/passage.parser';
import { ShareService } from '../../../services/share.service';
import { Author } from '../../../../../core/models/content.models';


import { BaseSectionViewComponent } from '../base-section-view.component';
import { SectionViewService } from '../../../services/section-view.service';
import { ContentImageComponent } from "../../content-image/content-image.component";
import { CommentaryService } from '../../../services/commentary.service';

import { NgbModal, NgbModalModule, NgbCarouselModule, NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { AuthorStateService } from '../../../services/author-state.service';
import { CommentaryViewComponent } from '../commentary-view/commentary-view.component';
import { ContentService } from '../../../services/content.service';
import { SettingsService } from '../../../services/settings.service';
@Component({
  selector: 'cr-verse-view',
  standalone: true,
  imports: [CommonModule, MarkdownModule, ContentImageComponent, NgbModalModule, NgbCarouselModule, CommentaryViewComponent, NgbCollapseModule],
  template: `
    <div class="verse-view pb-5 pt-0 mt-0" #sectionContent>
    <div class="my-3" *ngIf="section && getImageSrc() && showImages">
        <cr-content-image [partId]="this.partId" [sectionId]="this.section.id"></cr-content-image>         
    </div>
        <!-- Current Subsection Content -->
        <div class="subsection-content" *ngIf="section" id="subsection-content">
          <div class="d-flex justify-content-between align-items-center mb-3 px-3">
            <h3>{{section.title}}</h3>          
          </div>
          <hr>        
      <div class="passage-content card mb-2" *ngIf="passageLines.length > 0">
        <div class="card-body">
          <div class="verse-text">
            <ng-container *ngFor="let line of passageLines">
              <p class="verse-line">{{ line }}</p>
            </ng-container>              
          </div>
        </div>
      </div>

         <!-- Add Audio Player -->
      <div class="audio-player card mb-2 mt-1" *ngIf="audioUrl && audios_path">
        <div class="card-body">
          <div class="d-flex align-items-center">
            <button class="btn btn-secondary me-2" (click)="toggleAudio()">
              <i class="bi" [ngClass]="isPlaying ? 'bi-pause-fill' : 'bi-play-fill'"></i>
              {{ isPlaying ? 'Pause' : 'Listen' }} Chant
            </button>
            <audio #audioPlayer (ended)="onAudioEnded()" [src]="audioUrl"  (timeupdate)="onTimeUpdate()"></audio>
            <div class="progress flex-grow-1" style="height: 8px;" *ngIf="audioUrl">
              <div class="progress-bar bg-secondary" [style.width.%]="audioProgress"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="word-meanings-content card mb-4" *ngIf="section.wordMeanings">
        <div class="card-header">
        <div class="d-flex justify-content-between align-items-center" 
               (click)="isWordMeaningsCollapsed = !isWordMeaningsCollapsed"
               style="cursor: pointer;">
            <h5 class="text-secondary mb-0">Word Meanings</h5>
            <i class="bi" [ngClass]="isWordMeaningsCollapsed ? 'bi-chevron-down' : 'bi-chevron-up'"></i>
          </div>
        </div>
        <div class="card-body">
          <div class="mt-3" [ngbCollapse]="isWordMeaningsCollapsed">
            <ul class="list-group list-group-flush">
              <ng-container *ngFor="let wordMeaning of parseWordMeanings(section.wordMeanings)">
                <li class="list-group-item d-flex">
                  <span class="sanskrit-word fw-bold me-2">{{ wordMeaning.word }}</span>
                  <span class="meaning text-muted">{{ wordMeaning.meaning }}</span>
                </li>
              </ng-container>
            </ul>
          </div>
        </div>
      </div>

      <div class="meaning-content card mb-4" *ngIf="section.meaning">
        <div class="card-body">

          <div [innerHTML]="section.meaning"></div>    
        </div>
      </div>     
      
      <div class="meaning-content card mb-4" *ngIf="section.content">
        <div class="card-body">
          <markdown [data]="section.content"></markdown>
        </div>
      </div>     
</div>

      <cr-commentary-view [authors]="authors" [authorCommentary] = "authorCommentary" 
      [currentAuthor] = "currentAuthor"
      (authorSelected)= "selectAuthor($event)"
      *ngIf ="currentAuthor && authorCommentary"
      >
      </cr-commentary-view>
      
      
      <div class="commentary-content card" *ngIf="section.commentary && !authorCommentary">
      <div class="card-body">
        <markdown [data]="section.commentary"></markdown>
      </div>
    </div>

      
   
  `,
  styleUrls: ['./verse-view.component.scss']
})
export class VerseViewComponent extends BaseSectionViewComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  passageLines: string[] = [];
  authors: Author[] = [];
  currentAuthor?: Author;
  authorCommentary: string = '' as string;  

  modalRef: any;
  audioUrl: string | null = null;
  isPlaying: boolean = false;
 audioProgress: number = 0;
 audioBaseUrl: string = '';
 isWordMeaningsCollapsed = true;

  @ViewChild('audioPlayer') audioPlayer!: ElementRef<HTMLAudioElement>;

  constructor(
    sectionViewService: SectionViewService,
    contentService: ContentService,
    elementRef: ElementRef,
    private shareService: ShareService,
    private commentaryService: CommentaryService,
    private modalService: NgbModal,
    private authorStateService: AuthorStateService,
    private settingsService: SettingsService,
    private sanitizer: DomSanitizer,

  ) {
    super(sectionViewService, contentService, elementRef);  
  }

  // override ngOnInit() {
  //   this.splitPassage();
  // }
  
  override async ngOnChanges() {
    this.splitPassage();
    
  }

  private splitPassage() {
    if (this.section?.passage) {
      const parser = new PassageParser(this.section.passage);
      this.passageLines = parser.processLines();
    }
  }

  scrollToTop() {
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }, 100);
  }

  handleImageError(event: any) {
    event.target.style.display = 'none';
  }

 

  getImageSrc(): string {
    if (this.section) {
      return `${this.section.id}/section${this.section.id}.jpg`;
    }
    return '';
  }

  ngAfterViewInit() {
    this.loadImage();
    // this.scrollToTop();
  }


 override async ngOnInit() {   
  super.ngOnInit();
  this.audioBaseUrl = "https://vishalmanchanda.github.io/assets/gita_shloka_chants";
   this.splitPassage();
    this.authors =  await this.commentaryService.getAuthors();
    this.currentAuthor = await this.authorStateService.getSelectedAuthor(this.contentId) as Author | undefined;
    
    if (this.currentAuthor) {
     await this.selectAuthor(this.currentAuthor);
    } else if (this.authors.length > 0) {
      this.currentAuthor = this.authors[0];
      await this.selectAuthor(this.currentAuthor);
    } else {
      this.currentAuthor = undefined;
    }
    await this.loadAudio();
  }
    async loadCommentary() {
      if (this.currentAuthor) {
        this.authorCommentary = await this.commentaryService.getVerseCommentaryByAuthor(
          this.contentId,
          this.partId + '.' + this.section.id,
          this.currentAuthor.authorKey
        );
      } else {
        this.authorCommentary = this.section.commentary || '';
      }
    }

    async selectAuthor(author: Author) {
      if (this.currentAuthor) {
       // if (this.currentAuthor?.authorKey !== author.authorKey) { 
          this.currentAuthor = author;
          await this.loadCommentary();
          await this.authorStateService.setSelectedAuthor(this.currentAuthor, this.contentId);
        // }
      }
    }

    toggleAudio() {
      if (!this.audioPlayer) return;
      
      const audio = this.audioPlayer.nativeElement;
      
      if (this.isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      this.isPlaying = !this.isPlaying;
    }

    onAudioEnded() {
      this.isPlaying = false;
      this.audioProgress = 0;
    }

    @HostListener('timeupdate', ['$event'])
    onTimeUpdate() {
      if (!this.audioPlayer) return;
      
      const audio = this.audioPlayer.nativeElement;
      this.audioProgress = (audio.currentTime / audio.duration) * 100;
    }

     ngOnDestroy() {
      if (this.audioPlayer) {
        const audio = this.audioPlayer.nativeElement;
        audio.pause();
        audio.currentTime = 0;
      }

    }

    private async loadAudio() {
      if (this.partId && this.section) {
        const audioFileName = `${this.partId}-${this.section.id}.MP3`;
        this.audioUrl = `${this.audioBaseUrl}/${audioFileName}`;
        
        // Optionally check if audio exists
        try {
          const response = await fetch(this.audioUrl, { method: 'HEAD' });
          if (!response.ok) {
            this.audioUrl = null;
          }
        } catch {
          this.audioUrl = null;
        }
      }
    }

    parseWordMeanings(wordMeanings: string): { word: string; meaning: string }[] {
      if (!wordMeanings) return [];
      
      return wordMeanings.split(';')
        .map(pair => pair.trim())
        .filter(pair => pair.length > 0)
        .map(pair => {
          const [word, meaning] = pair.split('-').map(s => s.trim());
          return { word, meaning };
        });
    }
}


