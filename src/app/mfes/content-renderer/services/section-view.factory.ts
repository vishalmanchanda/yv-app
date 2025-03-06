import { Injectable, Type } from '@angular/core';
import { Section } from '../../../core/models/content.models'; 
import { VerseViewComponent } from '../components/section-views/verse-view/verse-view.component';
import { IntroViewComponent } from '../components/section-views/intro-view/intro-view.component';
import { DefaultViewComponent } from '../components/section-views/default-view/default-view.component';
import { QuestionViewComponent } from '../components/section-views/question-view/question-view.component';
import { ListingViewComponent } from '../components/section-views/listing-view/listing-view.component';


@Injectable({
  providedIn: 'root'
})
export class SectionViewFactory {
  private viewComponents = new Map<string, Type<any>>();

  constructor() {
    this.registerViewComponents();
  }

  private registerViewComponents() {
    this.viewComponents.set('verse', VerseViewComponent);
    this.viewComponents.set('intro', IntroViewComponent);
    this.viewComponents.set('default', DefaultViewComponent);
    this.viewComponents.set('question', QuestionViewComponent);
    this.viewComponents.set('listing', ListingViewComponent);
    // Register other view components here
  }

  getViewComponent(section: Section): Type<any> {
    console.log('getViewComponent', section.type);
    return this.viewComponents.get(section.type) || DefaultViewComponent;
  }
} 