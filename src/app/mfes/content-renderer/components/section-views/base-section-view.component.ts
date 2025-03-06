import { Directive, Input, ElementRef, OnInit, OnChanges } from '@angular/core';
import { Section } from '../../../../core/models/content.models';
import { SectionViewService } from '../../services/section-view.service';
import { ContentService } from '../../services/content.service';

@Directive()
export abstract class BaseSectionViewComponent implements OnInit, OnChanges {
  @Input() section!: Section;
  @Input() partTitle!: string;
  @Input() contentTitle!: string;
  @Input() partId!: string; 
  @Input() showImages!: boolean;
  @Input() contentId!: string;
  @Input() audios_path!: string;
  imageUrl = '';  

  constructor(
    protected sectionViewService: SectionViewService,
    protected contentService: ContentService,
    protected elementRef: ElementRef
  ) {}

  ngOnInit() {
    this.loadImage();
    this.sectionViewService.scrollToTop();
  }

  ngOnChanges() {
    this.loadImage();
    this.sectionViewService.scrollToTop();
  }

  protected async loadImage() {
    // if (this.section) {
    //   this.imageUrl = await this.sectionViewService.getImageUrl(this.section.id);
    // }
    // if (!this.imageUrl) {
    //   this.imageUrl = await this.contentService.getCoverImageUrl();
    //   if (!this.imageUrl) {
    //     this.imageUrl = 'assets/images/default.jpg';
    //   }
    // }
  }

  
} 