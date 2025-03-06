import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';



import { CommonModule } from '@angular/common';

import { SidebarComponent } from '../sidebar/sidebar.component';
import { Router } from '@angular/router';
// import { ContentService } from '../../services/content.service';

import JSZip from 'jszip';
import { SearchComponent } from '../../../../content-renderer/components/search/search.component';
import { ScrollHideDirective } from '../../../../content-renderer/directives/scroll-hide.directive';
import { ContentService } from '../../../../content-renderer/services/content.service';
import { ToastService } from '../../../../content-renderer/core/services/toast.service';
import { NavbarService } from '../../../../content-renderer/services/navbar.service';



@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, ScrollHideDirective, SidebarComponent, SearchComponent],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  @Input() title = 'Reader';
  @Input() categoryKey = '';

  @Output() contentLoaded = new EventEmitter<File>();
  @Output() searchClicked = new EventEmitter<void>();
  @Output() settingsClicked = new EventEmitter<void>();

  isMenuCollapsed = true;
  showOffcanvas = false;
  showSearch = false;
  isLoading = false;


  constructor(private modalService: NgbModal, private navbarService: NavbarService, private router: Router, 
    private toastr: ToastService,

     private contentService: ContentService

    ) {}

  closeSidebar() {
    this.showOffcanvas = false;
  }
  openSidebar(){
    this.showOffcanvas = !this.showOffcanvas;
  }

  openSearch() {
    this.searchClicked.emit();
  }

  openAdvancedSettings() {
    this.closeSidebar();
    this.settingsClicked.emit();
  }

  async loadContent(file: File): Promise<void> {
    this.closeSidebar();
    this.isLoading = true;    
    try {
      const fileUrl = URL.createObjectURL(file);
      await this.contentService.loadContentPackage(fileUrl);            
      this.isLoading = false;      
      this.router.navigate(['/reader'], { queryParams: { category: this.categoryKey } });

    } catch (error) {
      console.error('Error loading content:', error);
      this.toastr.show('Error loading content', 'Please try again later');

    } finally {
      this.isLoading = false;      
    }
  }

  
  leadingAction() {
      this.openSidebar();
   
  }

  goToHome(){
    this.router.navigate(['/home']);
  }

  showContent(){
    this.router.navigate(['/home']);
    //scroll down 300px
    window.scrollBy(0, 500);  
  }

  goToHackathons() {
    // Navigate to the static HTML file
    window.location.href = 'hackathon.html';
  }

  aboutUs(){
    window.location.href = 'about.html';
  }

  }