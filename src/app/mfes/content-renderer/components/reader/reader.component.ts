import { AfterViewInit, Component, OnChanges, OnDestroy, OnInit, SimpleChanges, TemplateRef, ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbOffcanvas, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Subscription } from 'rxjs';

// Components

import { SearchComponent } from '../search/search.component';
import { PartsListComponent } from '../parts-list/parts-list.component';

import { SectionViewComponent } from '../section-view/section-view.component';
import { ToolbarComponent } from '../toolbar/toolbar.component';

// Services
import { ContentService } from '../../services/content.service';

import { ProgressService } from '../../services/progress.service';
import { ShareService } from '../../services/share.service';
import { NavbarService } from '../../services/navbar.service';
import { SettingsService } from '../../services/settings.service';
import { SearchStateService, SearchState } from '../../services/search-state.service';

// Models
import { UserPreferences, Bookmark, Section } from '../../../../core/models/content.models';

// Utils
import { PassageParser } from './passage.parser';

// Interfaces
import { ReaderState } from '../../models/reader.interface';



import { ToastService } from '../../core/services/toast.service';


import { SentenceCasePipe, TruncatePipe } from "../../core/utils/string-utils";

import { GenericNavbarComponent } from '../../shared/components/generic-navbar/generic-navbar.component';
import { CategoryContentService } from '../../services/category-content.service';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    SectionViewComponent,
    ToolbarComponent,
    SentenceCasePipe,
    TruncatePipe,
    FormsModule,
    MarkdownModule,
    GenericNavbarComponent
],
  providers :[NgbActiveModal],
  selector: 'cr-reader',
  templateUrl: './reader.component.html',
  styleUrls: ['./reader.component.scss']
})
export class ReaderComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges {

  state: ReaderState = {
    metadata: null,
    currentPart: null,
    currentSection: null,
    currentSectionIndex: 0,
    isLoading: false,
    isSidebarCollapsed: false,
    isBookmarked: false,
    passageLines: []
  };
  
  categoryKey = '';
  searchModalOpen = false;
  searchState: SearchState | null = null;
  toolbarVisible = false;

  @ViewChild('sidebarContent') sidebarContent!: TemplateRef<any>;
  @ViewChild('navigationOverlay') navigationOverlay!: TemplateRef<any>;


  
  private readonly imageCache = new Map<string, string>();
  private readonly imageUrls: string[] = [];
  private readonly LAZY_LOAD_DELAY = 100;
  private readonly LAZY_LOAD_OPTIONS = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1
  };

  hasActiveSearch = false;
  currentSearchQuery = '';

  showImages = true;
  
  isDarkTheme = false;

  showToolbar = false;
  isClosing = false;
  fontSize = 100; // percentage



  constructor(
    private contentService: ContentService,
    private categoryContentService: CategoryContentService,

    private progressService: ProgressService,
    private modalService: NgbModal,
    private ngbActiveModal: NgbActiveModal,
    private offcanvasService: NgbOffcanvas,
    private shareService: ShareService,
    private navbarService: NavbarService,
    private settingsService: SettingsService,
    private route: ActivatedRoute,
    private searchStateService: SearchStateService,
    private toastr: ToastService,
    private router: Router,

  ) {

  }

  

  async ngOnInit() {
    let partIdParam = 0;
    let sectionIdParam = 0;
    let contentIdParam = '';
    let localeParam = 'en';
    
    // Load saved preferences first
    this.settingsService.getPreferences().subscribe(prefs => {
      this.applyPreferences(prefs);
    });

    // Get route parameters first
    await new Promise<void>(resolve => {
      this.route.params.subscribe(params => {
        if (params['contentId']) {
          contentIdParam = params['contentId'];
          console.log('contentId from route params on init', contentIdParam);
        }
        if (params['locale']) {
          localeParam = params['locale'];
          console.log('locale from route params on init', localeParam);
        }
        if (params['category']) {
          this.categoryKey = params['category'];
          console.log('categoryKey from route params on init', this.categoryKey);
        }
        if (params['partId']) {
          partIdParam = parseInt(params['partId']);
          console.log('partId from route params', partIdParam);
        }
        if (params['sectionId']) {
          sectionIdParam = parseInt(params['sectionId']);
          console.log('sectionId from route params', sectionIdParam);
        }
        resolve();
      });
    });

    // If we have direct section parameters, load the content first
    if (contentIdParam && localeParam && this.categoryKey) {
      console.log('Loading content item:', this.categoryKey, localeParam, contentIdParam);
      await this.categoryContentService.loadContentItem(this.categoryKey, localeParam, contentIdParam);
      
      // Wait for metadata to be available
      await new Promise<void>(resolve => {
        this.contentService.getMetadata().subscribe(metadata => {
          this.state.metadata = metadata;
          resolve();
        });
      });

      // If partId and sectionId are provided in the route, use them
      if (partIdParam > 0 && sectionIdParam > 0) {
        console.log('Loading specific part and section:', partIdParam, sectionIdParam);
        await this.loadPart(partIdParam);
        // Wait for part to be loaded
        await new Promise<void>(resolve => {
          this.contentService.getCurrentPart().subscribe(part => {
            this.state.currentPart = part;
            resolve();
          });
        });
        
        // Ensure section index is valid
        const sectionIndex = sectionIdParam - 1;
        if (this.state.currentPart && sectionIndex >= 0 && sectionIndex < this.state.currentPart.sections.length) {
          this.state.currentSectionIndex = sectionIndex;
          await this.loadSection();
        } else {
          console.error('Invalid section index:', sectionIndex);
          // Load first section as fallback
          this.state.currentSectionIndex = 0;
          await this.loadSection();
        }
        return;
      }
      
      // Otherwise use defaults
      partIdParam = 1;
      sectionIdParam = 1;
    } else {
      // Check query params if no route params
      this.route.queryParams.subscribe(params => {
        if (params['category']) {
          this.categoryKey = params['category'];
          console.log('categoryKey from query params on init', this.categoryKey);
        }
        if (params['partId'] && params['sectionId']) {
          partIdParam = parseInt(params['partId']);
          sectionIdParam = parseInt(params['sectionId']);
        }
        if (params['contentId']) {
          contentIdParam = params['contentId'];
          console.log('contentId from query params on init', contentIdParam);
        }
      });
    }

    // Subscribe to part changes
    this.contentService.getCurrentPart().subscribe(part => {
      this.state.currentPart = part;
    });

    // Load content based on parameters if not already loaded
    if (!this.state.currentSection) {
      await this.loadPartAndSection(partIdParam, sectionIdParam);
    }
    this.splitPassage();
  

    // Load bookmarks
    this.progressService.getProgress().subscribe(progress => {
      if (this.state.currentPart) {
        this.state.isBookmarked = progress.bookmarks.some(  
          (b:Bookmark) => b.partId === this.state.currentPart?.id    
        );
      }
    });

     this.searchState = await this.searchStateService.getSearchState();
    if (this.searchState) {
      this.hasActiveSearch = this.searchState.isActive;
      this.currentSearchQuery = this.searchState.query;
    }

    // Close toolbar when clicking outside
    document.addEventListener('click', (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const toolbar = document.getElementById('toolbar');
      const button = document.getElementById('stickyButton');
      
      if (this.showToolbar && 
          toolbar && 
          button && 
          !toolbar.contains(target) && 
          !button.contains(target)) {
        this.closeToolbar();
      }
    });

    // Load image preference
    const savedImagePreference = localStorage.getItem('showImages');
    this.showImages = savedImagePreference ? savedImagePreference === 'true' : true;
  }

  ngAfterViewInit() {
    this.splitPassage();
   
  }

  ngOnChanges(changes: SimpleChanges) { 
    this.splitPassage();
    this.categoryKey = this.route.snapshot.params['category'];
    console.log('categoryKey from query params on changes', this.categoryKey);
  }

  ngOnDestroy() {
    // Clear image cache
    this.imageCache.clear();
    
    // Revoke object URLs
    this.imageUrls.forEach(url => URL.revokeObjectURL(url));

    
  }



  private async loadPartAndSection(partId?: number, sectionId?: number) {
    const bookmark = await this.getBookMark();
    if(bookmark && !this.hasActiveSearch){
      await this.resumeFromBookMark(bookmark);
      return;
    }

    if(partId && sectionId){
      if(partId > 0 && sectionId > 0){
        await this.loadPart(partId);
      
      this.state.currentSectionIndex = sectionId-1;
      await this.loadSection();
      }
    } else {
      await this.loadPart(1);
      this.state.currentSectionIndex = 0;
      await this.loadSection();
    }
  
  }

  async getBookMark(): Promise<Bookmark | null>  {
    if (this.categoryKey && this.state.metadata?.id) {
      const bookmark = await this.contentService.getResumeBookMark(this.categoryKey, this.state.metadata?.id);
      return bookmark || null;
    }
    return null;
  }

  async resumeFromBookMark(bookmark: Bookmark){      
   if(bookmark){ 
        await this.loadPart(bookmark.partId);
        this.state.currentSectionIndex = parseInt(bookmark.subsectionId);
        await this.loadSection();       
        this.toastr.show('info','Resumed from bookmark', 'bg-success text-light');
      } 
      }    
  

  private applyPreferences(prefs: UserPreferences) {
    const contentArea = document.querySelector('.content-area');
    if (contentArea) {
      (contentArea as HTMLElement).style.fontSize = `${prefs.fontSize}px`;
       (contentArea as HTMLElement).style.lineHeight = prefs.lineSpacing.toString();
      (contentArea as HTMLElement).style.fontFamily = prefs.fontFamily;
    }
  }

  async loadPart(partId: number) {
    this.state.isLoading = true;
    try {
      await this.contentService.loadPart(partId);

      if (this.state.currentPart) {
        await this.progressService.updateProgress(partId, 0);
      }
    } catch (error) {
      console.error('Error loading part:', error);
    } finally {
      this.state.isLoading = false;
    }
  }

  async toggleBookmark() {
    if (!this.state.currentPart) return;

    const bookmark: Bookmark = {
      id: `${this.state.currentPart.id}-${this.state.currentPart.sections[0].id}-${this.state.currentSectionIndex}`,
      title: this.state.metadata?.title || '',
      language: this.state.metadata?.language || 'en',
      imageUrl: this.state.metadata?.coverImage || '',
      partId: this.state.currentPart.id,
      sectionId: this.state.currentPart.sections[0].id.toString(),
      subsectionId: this.state.currentSectionIndex.toString(),
      categoryKey: this.categoryKey || '',
      contentId: this.state.metadata?.id || '',
      timestamp: new Date()
    };

    if (this.state.isBookmarked) {
      await this.progressService.removeBookmark(
        `${bookmark.partId}-${bookmark.sectionId}`
      );
    } else {
      await this.progressService.addBookmark(bookmark);
    }
    
    this.state.isBookmarked = !this.state.isBookmarked;
  }



  openSearch() {
    const modalRef = this.modalService.open(SearchComponent, { size: 'lg', fullscreen:true });
    modalRef.componentInstance.isModalOpen = true;
    this.searchModalOpen = true;
    console.log('openSearch', this.hasActiveSearch, this.searchState);
    if (this.hasActiveSearch && this.searchState) {
      modalRef.componentInstance.restoreSearchState(this.searchState);
      console.log('restoredState');
    }
    
    modalRef.result.then((result) => {

      if (result?.returnToSearch) {
        this.searchModalOpen = false;        
        this.hasActiveSearch = true;
        this.searchState = result.searchState;
        this.currentSearchQuery = result.searchQuery;
        this.loadPartAndSection(result.partId, result.sectionId);
      }
    }).catch((e) => {
      console.log("search cancelled "+e);
    });
  }

  // toggleSettings() {
  //   if (this.toolbar) {
  //     this.toolbar.toggle();
  //     this.toolbarVisible = !this.toolbarVisible;
  //   }
  // }

  loadPreviousPart() {
    if (this.state.currentPart && this.state.currentPart.id > 1) {
      this.loadPart(this.state.currentPart.id - 1);
    }
  }

  loadNextPart() {
    if (this.state.currentPart && this.state.metadata) {
      const nextPartId = this.state.currentPart.id + 1;
      if (nextPartId <= this.state.metadata.partsMetadata.length) {
        this.loadPart(nextPartId);
      }
    }
  }

  hasPreviousPart(): boolean {
    return this.state.currentPart ? this.state.currentPart.id > 1 : false;
  }

  hasNextPart(): boolean {
    return this.state.currentPart && this.state.metadata ? 
      this.state.currentPart.id < this.state.metadata.partsMetadata.length : false;
  }

  async loadSection() {
    if (this.state.currentPart) {
      this.state.currentSection = await this.state.currentPart.sections[this.state.currentSectionIndex];
      await this.progressService.updateProgress(this.state.currentPart.id, this.state.currentSectionIndex);
      console.log('updating bookmark '+ this.categoryKey, this.state.metadata?.id);

      if (!this.state.metadata) {
        this.state.metadata = await this.contentService.getCurrentMetadata() || null;
      }
      
      if(this.categoryKey && this.state.metadata){
        console.log('updating bookmark inside '+ this.categoryKey, this.state.metadata?.id);
        
        const bookmark:Bookmark = 
          {
            id: `${this.categoryKey}-${this.state.metadata?.id}`,
            language: this.state.metadata?.language || 'en',
            title: this.state.metadata?.title || '',
            imageUrl: this.state.metadata?.coverImage || '',
            contentId: this.state.metadata?.id || '',
            partId: this.state.currentPart.id,
            sectionId: this.state.currentSection.id.toString(),
            subsectionId: this.state.currentSectionIndex.toString(),
            categoryKey: this.categoryKey,
            timestamp: new Date()
          };
        
      await this.contentService.updateResumeBookMark(bookmark);
      console.log('updated bookmark inside '+bookmark);
      }
      
      
    }
  }

  async navigateNext() {
    console.log('navigateNext', this.hasNextSection(), this.state.currentSection);
    if (this.hasNextSection()) {
      this.state.currentSectionIndex++;
      await this.loadSection();
    } else if (this.hasNextPart() && this.state.currentPart) {
      await this.loadPart(this.state.currentPart.id + 1);
      this.state.currentSectionIndex = 0;
      await this.loadSection();
    }

  }

  async navigatePrevious() {

    if (this.hasPreviousSection() && this.state.currentSection) {
      this.state.currentSectionIndex--;
      await this.loadSection();
    } else if (this.hasPreviousPart() && this.state.currentPart) {
      await this.loadPart(this.state.currentPart.id - 1);
      this.state.currentSectionIndex = this.state.currentPart.sections.length - 1;
      await this.loadSection();
    }
  }

  hasNextSection(): boolean {
    return this.state.currentPart ? 
      this.state.currentSectionIndex < this.state.currentPart.sections.length - 1 : 
      false;
  }

  hasPreviousSection(): boolean {
    return this.state.currentSectionIndex > 0;
  }

  
  openNavigationOverlay() {
    this.modalService.open(this.navigationOverlay, {
      fullscreen: true,
      backdrop: 'static',
      keyboard: false,
      scrollable: true
    });
  }

  closeNavigationOverlay() {
    this.modalService.dismissAll();
  }

  async navigateToSection(index: number) {
    this.state.currentSectionIndex = index;
    await this.loadSection();
    this.closeNavigationOverlay();
  }

  async navigateToPreviousPart() {
    if (this.hasPreviousPart() && this.state.currentPart) {
      await this.loadPart(this.state.currentPart.id - 1);

    }
  }

  async navigateToNextPart() {    
    if (this.hasNextPart() && this.state.currentPart) {
      await this.loadPart(this.state.currentPart.id + 1);

    }
  }

  showPartsList() {
    const modalRef = this.modalService.open(PartsListComponent, {
      fullscreen: true,
      backdrop: 'static',
      keyboard: false,
      scrollable: true
    });
    modalRef.componentInstance.parts = this.state.metadata?.partsMetadata;
    modalRef.componentInstance.currentPartId = this.state.currentPart?.id;
    modalRef.componentInstance.partSelected.subscribe(async (partId: number) => {
      await this.loadPart(partId);
      this.closeNavigationOverlay();
      this.showSectionsList();
    });
  }

  showSectionsList() {
    setTimeout(() => {
      this.openNavigationOverlay();
    }, 100);
  }

  shareSectionAsPDF() {
    const filename = `${this.state.currentPart?.title}-${this.state.currentSection?.title}`;
  //  this.shareService.shareAsPDF('subsection-content', filename, this.settingsService.getTheme());
    this.shareService.shareAsImageInPDF('subsection-content', filename, this.settingsService.getTheme());
  }

  handleImageError(event: any) {
    // Hide the image element if loading fails
    event.target.style.display = 'none';
  }


  splitPassage() {
    if (this.state.currentSection && this.state.currentSection.passage) {   
      const parser = new PassageParser(this.state.currentSection.passage);
      this.state.passageLines = parser.processLines();    
  }
  }

  getImageSrc(): string {
    if (!this.state.currentPart || !this.state.currentSection) {
      return '';
    }
    return `${this.state.currentPart.id}/section${this.state.currentSection.id}.jpg`;
  }

  private async navigateToVerse(chapter: string, verse: string) {
    await this.loadPart(parseInt(chapter));
    const sectionIndex = this.state.currentPart?.sections.findIndex(
      section => section.title.includes(`${chapter}.${verse}`)
    );
    if (sectionIndex !== undefined && sectionIndex !== -1) {
      this.state.currentSectionIndex = sectionIndex;
      await this.loadSection();
    }
  }

  async clearSearch() {
    this.hasActiveSearch = false;
    this.currentSearchQuery = '';
    await this.searchStateService.clearSearchState();
  }

  async returnToSearch() {    
     const searchState = await this.searchStateService.getSearchState();
     
    if (searchState) {
      
      const modalRef = this.modalService.open(SearchComponent, { size: 'lg', fullscreen: true });
      this.searchModalOpen = true;
      modalRef.componentInstance.restoreSearchState(searchState);
      modalRef.result.then(async (result) => {
        this.searchModalOpen = false;
        this.currentSearchQuery = result.searchQuery;
        await this.loadPartAndSection(result.partId, result.sectionId);
      });
    }
  }

  onSearchClicked() {
    this.openSearch();
  }

  onToggleImageShow() {    
    this.showImages = !this.showImages;
    // Store the preference
    localStorage.setItem('showImages', this.showImages.toString());
  }

  
   leadingAction(){
    if (!this.router.url.includes('/home')){
      this.router.navigate(['/home']);
    } else {
      this.router.navigate(['/', this.state.metadata?.id]);
    }
      
  }

  deriveSectionClass(section: Section) {
    return {
      'col-6 col-md-6': section.title.split(' ').some((word: string) => word.length >= 12),
      'col-4 col-md-4': section.title.split(' ').some((word: string) => word.length >= 5 && word.length < 12),
      'col-3 col-md-3': section.title.split(' ').every((word: string) => word.length < 5)
    };
  }

  toggleToolbar(): void {
    if (this.showToolbar) {
      this.closeToolbar();
    } else {
      this.openToolbar();
    }
  }

  openToolbar(): void {
    this.isClosing = false;
    this.showToolbar = true;
  }

  closeToolbar(): void {
    this.isClosing = true;
    
    setTimeout(() => {
      this.showToolbar = false;
      this.isClosing = false;
    }, 300);
  }

  increaseFontSize(): void {
    if (this.fontSize < 180) {
      this.fontSize += 10;
      this.applyFontSize();
    }
  }

  decreaseFontSize(): void {
    if (this.fontSize > 70) {
      this.fontSize -= 10;
      this.applyFontSize();
    }
  }

  applyFontSize(): void {
    const contentElement = document.querySelector('.content-wrapper');
    if (contentElement) {
      (contentElement as HTMLElement).style.fontSize = `${this.fontSize}%`;
    }
  }

} 


