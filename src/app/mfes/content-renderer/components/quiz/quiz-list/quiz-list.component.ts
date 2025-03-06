import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ContentMetadata } from '../../../../../core/models/content.models';
import { ToastService } from '../../../core/services/toast.service';
import { ContentService } from '../../../services/content.service';
import { ModalService } from '../../../core/services/modal.service';
import { toCamelCase, SentenceCasePipe, TruncatePipe } from '../../../core/utils/string-utils';

import { GenericNavbarComponent } from '../../../shared/components/generic-navbar/generic-navbar.component';


@Component({
  selector: 'cr-quiz-list',  
  standalone: true,
  imports: [CommonModule, FormsModule, GenericNavbarComponent, SentenceCasePipe, TruncatePipe],
  template: `
    <div class="container mt-5 mb-5 pb-5">
    <cr-generic-navbar 
  [title]="(contentMeta?.title || '') | sentenceCase | truncate: 30"
  [leadingActionIcon]="'fas fa-chevron-left'"
  [leadingActionClick]="leadingAction.bind(this)"
  [actions]="[
    { icon: 'fa-solid fa-search', label: 'Search', click: openSearch.bind(this) },    
  ]"
  [dropdownActions]="[  
    { type: 'link', icon: 'fas fa-info-circle', label: 'About', link: '/about' },
    { type: 'link', icon: 'fas fa-question-circle', label: 'Help', link: '/help' }
  ]"
  >
</cr-generic-navbar>
    
      <div class="pt-4 mb-4 w-100 ">
    
        <p class="small mb-0 opacity-60" *ngIf="contentMeta?.description">
          {{ contentMeta?.description }}
        </p>
      
      </div>
      
      <div *ngIf="!studentNameAvailable" class="mb-4">
        <h4>Enter Your Name to Start</h4>
        <div class="input-group mb-3">
          <input type="text" class="form-control" [(ngModel)]="tempStudentName" placeholder="Your Name" aria-label="Your Name">
          <button class="btn btn-primary" type="button" (click)="setStudentName()" [disabled]="!tempStudentName">Continue</button>
        </div>
      </div>

      <div *ngIf="studentNameAvailable" class="student-welcome-section">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h5 class="welcome-message opacity-75">Welcome, <span class="student-name">{{ studentName }}</span></h5>
            <button class="btn btn-sm btn-outline-primary" (click)="changeName()">Change Name</button>
            </div>

        <!-- Name Change Confirmation Modal -->
        <div class="modal fade" id="nameChangeModal" tabindex="-1" aria-labelledby="nameChangeModalLabel" aria-hidden="true">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="nameChangeModalLabel">Confirm Name Change</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <p>Are you sure you want to change your name? This will reset your quiz progress.</p>
       
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary" (click)="changeName()" [disabled]="!tempStudentName" data-bs-dismiss="modal">Confirm Change</button>
              </div>
            </div>
          </div>
        </div>
        <div class="list-group">
          <button *ngFor="let part of contentMeta?.partsMetadata; let i = index"
                  (click)="startQuizForChapter(i + 1)"
                  class="list-group-item list-group-item-action mb-2"
                  [ngClass]="{'border-success': getLastAttemptScore(i + 1)! >= 80,
                              'border-warning': getLastAttemptScore(i + 1)! >= 60 && getLastAttemptScore(i + 1)! < 80,
                              'border-danger': getLastAttemptScore(i + 1)! < 60 && getLastAttemptScore(i + 1)! !== null,
                              'border-primary border-opacity-50': getLastAttemptScore(i + 1)! === null
                             }"
                  [ngStyle]="{'border-left-width': getLastAttemptScore(i + 1) !== null ? '5px' : '2px'}">
                  <div class="d-flex w-100 justify-content-between align-items-center">
                    <p class="mb-0 small text-muted"> {{ part.title.split(':')[0] || '' }}</p>
                    <span class=" px-3 py-1 mt-1 mb-0 small">{{ part.sectionCount }} questions</span>
                  </div>
            <div class="d-flex w-100 justify-content-between align-items-center">
              
                <h6 class="mb-1 fw-semi-bold opacity-80 text-primary">{{ i + 1 }}. {{ part.title.split(':')[1] || part.title }}</h6>              
            </div>
            <p class="mb-1 small text-muted opacity-60">{{ part.description }}</p>
            <div *ngIf="getLastAttemptScore(i + 1)" class="d-flex justify-content-between align-items-center mt-2 mb-1">
              <button class="btn btn-sm btn-outline-secondary" (click)="openLastReport(i + 1)">Last attempt: {{ getLastAttemptScore(i + 1) }}%</button>
              <button *ngIf="getLastAttemptScore(i + 1)!== null && getLastAttemptScore(i + 1)! < 100" class="btn btn-sm btn-outline-secondary" (click)="startPartialQuiz(i + 1, $event)">
                Practice Mistakes
              </button>
            </div>
          </button>
        </div>
      </div>
    </div>
    <footer class="fixed-bottom py-3 shadow-lg">
      <div class="container d-flex justify-content-between align-items-center">
        <a href="mailto:contact@example.com" class="text-decoration-none">Contact Us</a>
        <button class="btn btn-success" (click)="refreshList()">
          <i class="fas fa-sync-alt"></i> &nbsp;Refresh 
        </button>
      </div>
    </footer>
  `,
  styleUrls: ['./quiz-list.component.scss']
})
export class QuizListComponent implements OnInit {
  contentMeta: ContentMetadata | undefined;
  studentName = '';
  studentNameAvailable = false;
  tempStudentName = '';
  contentId = '';
  category = 'apt';
  showFullDescription = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private contentService: ContentService,
    private toastService: ToastService,
    private modalService: ModalService,
  ) {}

// add bootstrap toastr



  ngOnInit() {
    this.route.params.subscribe(params => {
      this.contentId = params['bookId'];
      this.category = params['category'];
      this.loadContentData();
    });
    this.loadStudentName();
  }

  async loadContentData() {
    try {
      console.log('Loading content data for bookId:', this.contentId);
      // let contentItem = this.contentService.contentItems?.find(item => item.id === this.contentId);
      // if (!contentItem) {
      //   this.contentId = this.contentService.contentItems?.[0]?.id || '';
      //   contentItem = this.contentService.contentItems?.find(item => item.id === this.contentId);
      // }
      console.log('Content ID:', this.contentId);
      // if (!this.contentService.isContentItemLoaded(contentItem!)) {

      //   await this.contentService.loadContentItemById(this.contentId);

      // }
      this.contentMeta = await this.contentService.getCurrentMetadata();
      console.log('Content metadata loaded:', this.contentMeta);
    } catch (error) {
      console.error('Error loading book data:', error);
      // Handle error (e.g., redirect to error page)
    }
  }
  

  loadStudentName() {
    this.studentName = localStorage.getItem('studentName') || '';
    this.studentNameAvailable = this.studentName.length > 0;
  }

  setStudentName() {
    this.studentName = this.tempStudentName.trim();
    localStorage.setItem('studentName', this.studentName);
    this.studentNameAvailable = true;
    this.tempStudentName = '';
  }

  async changeName() {
    const confirmed = await this.modalService.open({
      title: 'Change Name',
      body: 'Are you sure you want to change your name? This will clear your current progress.',
      confirmText: 'Yes',
      cancelText: 'No'
    });

    if (confirmed) {
      console.log('User confirmed name change');
      localStorage.removeItem('studentName');
      this.studentName = '';
      this.tempStudentName = '';
      this.studentNameAvailable = false;
      
    } else {
      console.log('User cancelled name change');
    }
  }

  startQuizForChapter(partId: number) {
    this.router.navigate(['/quiz-viewer', this.category, this.contentId, partId]);
  }

  getLastAttemptScore(partId: number): number | null {

    const key = `quizResults_${this.contentId}_${partId}_${toCamelCase(this.studentName)}`;
    console.log(`Attempting to retrieve quiz results for key: ${key}`);
    
    const storedResults = localStorage.getItem(key);
    if (storedResults) {
      try {
        const results = JSON.parse(storedResults);
        console.log(`Retrieved results for ${key}:`, results);
        
        if (results.score && typeof results.score.correct === 'number' && typeof results.score.total === 'number') {
          const score = Math.round((results.score.correct / results.score.total) * 100);
          console.log(`Calculated score for ${key}: ${score}%`);
          return score;
        } else {
          console.error(`Invalid score format for ${key}:`, results.score);
        }
      } catch (error) {
        console.error(`Error parsing stored results for ${key}:`, error);
      }
    } else {
      console.log(`No stored results found for ${key}`);
    }
    
    return null;
  }

  startPartialQuiz(partId: number, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/quiz-viewer', this.category, this.contentId, partId], { 
      queryParams: { mode: 'partial', studentName: this.studentName }
    });
  }

  refreshList() {
    this.contentService.clearDatabase();
    this.loadContentData();  
    // Show success toast
    this.toastService.show('Success', 'List refreshed successfully', 'bg-success text-light');   
  }

  openLastReport(partId: number) {
    this.router.navigate(['/quiz-report', this.category, this.contentId, partId, this.studentName], {
      queryParams: { studentName: this.studentName }
    });
  }

  leadingAction() {    
    if (!this.router.url.includes('/home')){
      this.router.navigate(['/home']);
    } else {
      this.router.navigate(['/']);
    }
  }

  openSearch() {
    console.log('Search button clicked');
  }
}
