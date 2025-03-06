import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SettingsService } from '../../../../content-renderer/services/settings.service'; 

import { ContentService } from '../../../../content-renderer/services/content.service';
import { ToastService } from '../../../../content-renderer/core/services/toast.service';
import { CategoryContentService } from '../../../../content-renderer/services/category-content.service';
import { ContentItem } from '../../../../../core/models/content.models';
import { LANGUAGE_NAMES } from '../../../../content-renderer/core/constants/language.constants';


@Component({
  selector: 'app-category-content',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="category-content-wrapper container mx-auto px-4 pb-5 pt-4">

    <p class="text-center text-muted h4 mb-4 mt-4 py-2">Explore the collection</p>
      <!-- Language Tabs -->
      <ul class="nav nav-tabs">
        <li class="nav-item h5" *ngFor="let locale of availableLocales">
          <p class="nav-link" 
             [class.active]="selectedLocale === locale"
             (click)="selectLocale(locale)">
            {{ LANGUAGE_NAMES[locale] }}
</p> 
        </li>
      </ul>

      <!-- Content Items -->
      <div class="row">
        <div class="col-md-6 col-lg-4 mb-4" *ngFor="let item of localeWiseContent[selectedLocale]">          
          <div class="card bg-dark text-white" (click)="launchContentView(item)">
            <img [src]="item.coverImage" [alt]="item.title" 
                 class="card-img-top" style="height: 200px; object-fit: cover; opacity: 0.75;" 
                 *ngIf="item.coverImage">
            <div class="card-img-overlay">
              <div style="bottom: 0px; position: absolute; left: 0px; right: 0px;background: rgba(0, 0, 0, 0.55); padding: 10px;" >
                <h5 class="card-title h5" >{{ item.title }}</h5>
                <p class="card-text h6">{{ item.authors[0].name }}</p>
              </div>
              <!-- <p class="card-text text-white">{{ item.description }}</p> -->
            </div>
  </div>
</div>
        </div>
      </div>

  <div *ngIf="isLoading" class="modal" tabindex="-1" role="dialog" style="display: block; background: --var(-bs-body-bg);">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-body text-center">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2">Loading, please wait...</p>
        </div>
      </div>
    </div>
  </div>

    
  `,
  styleUrls: ['./category-content.component.scss']
})
export class CategoryContentComponent implements OnInit {
  @Input() categoryKey = '';

  supportedLocales: string[] = ['hi', 'en'];
  localeWiseContent: { [key: string]: ContentItem[] } = {};
  selectedLocale = 'hi';
  LANGUAGE_NAMES = LANGUAGE_NAMES;
  availableLocales: string[] = [];
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private categoryContentService: CategoryContentService,
    private contentService: ContentService,
    private toastr: ToastService,
    private settingsService: SettingsService

  ) {}

  ngOnInit() {
    // this.route.params.subscribe(params => {
    //   const categoryKey = params['key'];
    //   this.supportedLocales.forEach(locale => {
    //     this.loadCategoryContent(categoryKey, locale);
    //   });
    // });

    this.supportedLocales.forEach(locale => {
      this.loadCategoryContent(this.categoryKey, locale);
    });
    this.settingsService.updatePreferences({theme: this.settingsService.getTheme()});

  }

  private loadCategoryContent(categoryKey: string, locale = 'en') {
    this.categoryContentService.getCategoryContent(categoryKey, locale).then(
      items => {
        if (items && items.length > 0) {
          this.localeWiseContent[locale] = items;
          if (!this.availableLocales.includes(locale)) {
            this.availableLocales.push(locale);
          }
        }
        this.selectedLocale = this.availableLocales[0];
      }
    );
  }

  selectLocale(locale: string) {
    this.selectedLocale = locale;
  }

  async launchContentView(item: ContentItem) {
    if(item.status === 'comingSoon'){
      this.toastr.show('Coming Soon', 'Kindly wait! This content is coming soon', "bg-primary text-light lead");
      return;
    }
    try {
        this.isLoading = true;
        await this.contentService.loadContentPackage(item.zipUrl);
        if (item.type === 'quiz') {
            this.router.navigate(['/quiz-list', this.categoryKey, item.id]);
        } else {

            this.router.navigate(['/reader'], { queryParams: { category: this.categoryKey } });
        }
    } catch (error) {
        this.toastr.show('Error loading content', 'Please try again later', "bg-error text-light");  
    } finally {
      this.isLoading = false;
    }
    
    
  }

  leadingAction(){
    if (!this.router.url.includes('/home')){
      this.router.navigate(['/home']);
    } else {
      this.router.navigate(['/']);
    }
  }

  openSearch(){
   this.toastr.show('Search', 'Search feature is coming soon', "bg-primary text-light lead");
  }
}
