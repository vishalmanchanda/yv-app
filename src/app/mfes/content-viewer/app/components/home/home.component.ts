// content.component.ts
import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { NavbarComponent } from "../navbar/navbar.component";
import { SettingsComponent } from '../settings/settings.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CategoryContentComponent } from '../category-content/category-content.component';
import { ContentItem, UserPreferences } from '../../../../../core/models/content.models';
import { Bookmark } from '../../../../../core/models/content.models';
import { SettingsService } from '../../../../content-renderer/services/settings.service';
import { CategoryContentService } from '../../../../content-renderer/services/category-content.service';
import { ToastService } from '../../../../content-renderer/core/services/toast.service';
import { CommentaryService } from '../../../../content-renderer/services/commentary.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, NavbarComponent, CategoryContentComponent],
  templateUrl: './home.component.html',
  styleUrls :['./home.component.scss']
})
export class HomeComponent implements OnInit {

  contentItems: ContentItem[] = [];
  bookmarks: Bookmark[] = [];
  categoryKey = 'atma-gyan';
  categories: any[] = [
    {
      id: 1,
      key:"atma-gyan",
      name: 'Atma Gyan',
      icon: 'assets/images/meditation.jpg',
      description: 'Explore the essence of life and the universe'
    }
    
  ];

 

  constructor(private router: Router, private modalService: NgbModal, 
    private settingsService: SettingsService,
    private categoryContentService: CategoryContentService,
    private toastr: ToastService,
    private commentaryService: CommentaryService,
    private route: ActivatedRoute) {}

  ngOnInit() {
    this.settingsService.getPreferences().subscribe(prefs => {
      // this.applyPreferences(prefs);
      document.documentElement.dataset['theme'] = prefs.theme;
    });
    this.contentItems = [];
    
    // read path params
    this.route.params.subscribe(params => {
      this.categoryKey = params['key'];
    });

    if(this.categoryKey == undefined){
      this.categoryKey = 'atma-gyan';
    }

    this.loadBookmarks();
  }

  scrollDown() {
    window.scrollTo({ top: 500, behavior: 'smooth' });
  }

  navigateToCategory(categoryKey: string) {
    this.categoryKey = categoryKey;
    this.router.navigate(['/category', categoryKey] );
  }

  async navigateToBookmark(bookmark: Bookmark) {
    try{
    
      await this.categoryContentService.loadContentItem(bookmark.categoryKey, bookmark.language, bookmark.contentId);
      //update the timestamp of the bookmark
      bookmark.timestamp = new Date();
      this.categoryContentService.updateBookmark(bookmark);
      
      this.router.navigate(['/reader'], {
      queryParams: {  
        partId: bookmark.partId,
        sectionId: bookmark.sectionId,
        category: bookmark.categoryKey

    }});
  } catch(error){
      this.toastr.show('Error loading content', 'Please try again later');
    }
  }

  openAdvancedSettings() {
    
    this.modalService.open(SettingsComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
      scrollable: true,
      fullscreen: true
    });
  }

  loadBookmarks(){
    this.categoryContentService.loadBookmarks(10).then(bookmarks => {
      this.bookmarks = bookmarks;
    });
  }

  

  private applyPreferences(prefs: UserPreferences) {
    const contentArea = document.querySelector('.content-area');
    if (contentArea) {
      (contentArea as HTMLElement).style.fontSize = `${prefs.fontSize}px`;
      (contentArea as HTMLElement).style.lineHeight = prefs.lineSpacing.toString();
      (contentArea as HTMLElement).style.fontFamily = prefs.fontFamily;
    }
  }
}