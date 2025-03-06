import { Component, Input, ViewChild, ComponentRef, ViewContainerRef, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { Section } from '../../../../core/models/content.models';
import { SectionViewFactory } from '../../services/section-view.factory';


@Component({
  selector: 'cr-section-view',
  template: `<ng-container #viewContainer class="px-5"></ng-container>`,
  standalone: true
})
export class SectionViewComponent  implements OnInit, OnDestroy, OnChanges {
  @Input() section!: Section;
  @Input() partTitle!: string;
  @Input() contentTitle!:string; 
  @Input() audios_path!: string;
  @Input() partId!: string;
  @Input() contentId!: string;
  @Input() showImages!: boolean;
  @ViewChild('viewContainer', { read: ViewContainerRef, static: true })
  viewContainer!: ViewContainerRef;
  
  private componentRef: ComponentRef<any> | null = null;

  constructor(private sectionViewFactory: SectionViewFactory) {}

  ngOnInit() {
    this.loadComponent();
    

  }

  ngOnChanges(changes: SimpleChanges) {
   if ((changes['section'] && !changes['section'].firstChange) || (changes['showImages'] && !changes['showImages'].firstChange) || (changes['partId'] && !changes['partId'].firstChange)) {
      this.loadComponent();
    }
  }

  ngOnDestroy() {
    if (this.componentRef) {
      this.componentRef.destroy();
    }
  }

  private loadComponent() {
    const viewComponent = this.sectionViewFactory.getViewComponent(this.section);
    this.viewContainer.clear();
    this.componentRef = this.viewContainer.createComponent(viewComponent);
    this.componentRef.instance.section = this.section;
    this.componentRef.instance.partTitle = this.partTitle;
    this.componentRef.instance.contentTitle = this.contentTitle;
    this.componentRef.instance.partId = this.partId;
    this.componentRef.instance.showImages = this.showImages;
    this.componentRef.instance.contentId = this.contentId;
    this.componentRef.instance.audios_path = this.audios_path;
  }

  scrollToTop() {
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }, 100);
  }
} 