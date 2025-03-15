import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuestionViewComponent } from '../../section-views/question-view/question-view.component';
import { firstValueFrom, interval, Subscription } from 'rxjs';
import { ContentMetadata, Section } from '../../../../../core/models/content.models';
import { QuizService } from '../../../services/quiz.service';
import { ContentService } from '../../../services/content.service';
import { ModalService } from '../../../core/services/modal.service';
import { ToastService } from '../../../core/services/toast.service';
import { toCamelCase } from '../../../core/utils/string-utils';
import jsPDF from 'jspdf';

@Component({
  selector: 'cr-quiz-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule, QuestionViewComponent],
  template: `
    <div class="quiz-container" *ngIf="contentMeta">
      <div class="row px-3 py-2 mt-0 mb-3 rounded shadow d-flex justify-content-between align-items-center fixed-top">
        <div class="col-9">
          <p class="d-block mb-1 small opacity-75"> <strong>{{ studentName.length > 16 ? (studentName | slice:0:15) + '...' : studentName }}</strong></p>
        </div>                       
        <div class="col-2">        
          <div class="h6 text-primary d-inline-block">
            {{ formatTime(timer) }}
          </div>
        </div>
        <div class="row justify-content-center">
        <div class="col-auto progress w-100" style="height: 4px;">   
          <div class="progress-bar bg-primary" role="progressbar" 
               [style.width]="((currentSectionIndex + 1) / sections.length) * 100 + '%'"
               [attr.aria-valuenow]="currentSectionIndex + 1" 
               aria-valuemin="0" [attr.aria-valuemax]="sections.length">
          </div>
        </div> 
      </div>
      </div>
      
      <div style="height: 50px;"></div> 
      
      <div class="row" *ngIf="contentMeta && contentMeta?.partsMetadata">
        <p class="mb-0  small opacity-85">{{ contentMeta.partsMetadata[this.chapterNumber - 1].title.split(':')[0] || '' }}</p>
          <p class="mb-0 small opacity-75">{{ contentMeta.title }}</p>          
          <p class="mb-0 section-title">{{ contentMeta.partsMetadata[this.chapterNumber - 1].title.split(':')[1] || contentMeta.partsMetadata[this.chapterNumber - 1].title }}</p>
        </div>
      <hr class="mb-2">
      <!-- <div style="height: 120px;"></div>  -->
      <!-- Spacer to prevent content from being hidden behind fixed header -->
     
      <div *ngIf="showNameInput" class="name-input-screen">
        <div class="input-group mb-3">
          <input [(ngModel)]="tempStudentName" placeholder="Enter your name" class="form-control">
          <button (click)="setStudentName()" class="btn btn-primary" [disabled]="!tempStudentName">Start Quiz</button>
        </div>
      </div>

      <div *ngIf="quizStarted && !quizFinished" class="quiz-content">
        <cr-question-view 
          *ngIf="currentSection"
          [section]="currentSection"
          [index]="currentSectionIndex"
          [isLastQuestion]="isLastSection"
          [studentName]="studentName"
          [bookId]="bookId"
          [partId]="this.chapterNumber.toString()"
          [isPractice]="isPartialMode"
          (restartQuiz)="restartQuiz()">
        </cr-question-view>
        
      </div>
   

    
      <div *ngIf="quizStarted && !quizFinished" class="navigation-fixed">
        <div class="container">
          <div class="w-100 d-flex justify-content-between align-items-center">
            <div>
              <button (click)="exitQuiz()" class="btn btn-danger">
                <i class="fas fa-times"></i> &nbsp;Exit
              </button>
            </div>            
            <div class="text-center">
              <span class="font-weight-bold small">
                {{ currentSectionIndex + 1 }} / {{ sections.length }}
              </span>
            </div>            
            <div>
              <button *ngIf="!isLastSection" (click)="nextSection()" class="btn btn-primary">
                Next <i class="fas fa-arrow-right"></i>
              </button>
              <button *ngIf="isLastSection" (click)="showReport()" class="btn btn-success">
                Finish <i class="fas fa-flag-checkered"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
        
    </div>

  `,
  styleUrls: ['./quiz-viewer.component.scss']
})
export class QuizViewerComponent implements OnInit, OnDestroy {
  bookId = '';
  chapterNumber = 0;
  studentName = '';
  quizStarted = false;
  quizFinished = false;
  currentSection: Section | null = null;
  currentSectionIndex = 0;
  isLastSection = false;
  timer = 0;
  quizScore = { correct: 0, total: 0 };
  private timerSubscription: Subscription | null = null;
  sections: Section[] = [];
  incorrectSections: number[] = [];
  currentImageUrl: string | null = null;
  contentMeta: ContentMetadata | null = null;
  quizStartTime: Date | null = null;
  quizDuration = 0; 
  showNameInput = false;
  tempStudentName = '';
  isPartialMode = false;
  isHeaderScrolled = false;
  category = 'apt';
  constructor(
    private route: ActivatedRoute,
    private router: Router,

    private contentService: ContentService,
    private quizService: QuizService,
    private modalService: ModalService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.bookId = params['bookId'];
      this.chapterNumber = parseInt(params['partId']);
      this.category = params['category'];
    });

    this.route.queryParams.subscribe(params => {
      this.isPartialMode = params['mode'] === 'partial';
      this.studentName = localStorage.getItem('studentName') || params['studentName'] || '';
    });

    this.loadStudentName();
    this.loadContentData();
  }

  ngOnDestroy() {
    this.stopTimer();
  }

  loadStudentName() {
    this.studentName = localStorage.getItem('studentName') || '';
    this.showNameInput = !this.studentName;
  }

  async loadContentData() {
    try {
      this.contentMeta = await firstValueFrom(this.contentService.getMetadata());
      
      if (this.studentName) {
        // Name provided, start quiz directly
        this.loadChapterData();
      }
    } catch (error) {
      console.error('Error loading book data:', error);
      // Handle error (e.g., redirect to error page)
    }
  }

  async loadChapterData() {
    try {
      const part = await this.contentService.getPart(this.chapterNumber); 
      this.sections = part?.sections || [];
      if (this.isPartialMode) {
        this.filterSectionsForPartialMode();
      }
      this.startQuiz();
    } catch (error) {
      console.error('Error loading chapter data:', error);
      // Handle error (e.g., show error message)
    }
  }

  filterSectionsForPartialMode() {
    const key = `quizResults_${this.bookId}_${this.chapterNumber}_${toCamelCase(this.studentName)}`;
    const storedResults = localStorage.getItem(key);
    
    if (storedResults) {
      const results = JSON.parse(storedResults);      

      if (results.incorrectSections && Array.isArray(results.incorrectSections)) {
        this.sections = this.sections.filter((section, index) => {
          return results.incorrectSections.includes(index);
        });        
      } 
    } else {
      console.log('No stored results found, keeping all sections');
    }
  }

  startQuiz() {
    if (!this.studentName) {
      this.showNameInput = true;
      return;
    }else{
    this.quizStarted = true;
    this.showNameInput = false;
    this.currentSectionIndex = 0;
    this.updateCurrentSection();
    this.quizStartTime = new Date();
    this.startTimer();
    }
  }

  updateCurrentSection() {
    this.currentSection = this.sections[this.currentSectionIndex];
    this.isLastSection = this.currentSectionIndex === this.sections.length - 1;
    this.getCurrentImage();
  }

  async getCurrentImage() {
    // Implement logic to get the image URL based on the hierarchy (book > chapter > section)
    this.currentImageUrl = await this.contentService.getImageUrl(this.chapterNumber+".jpg");
  }

  nextSection() {
    if (!this.isLastSection) {
      this.currentSectionIndex++;
      this.updateCurrentSection();
    }
  }

  async finishQuiz() {
    this.quizFinished = true;
    this.stopTimer();
    try{
      console.log('Getting quiz score');
      this.quizScore = await this.quizService.getQuizScore(this.studentName, this.bookId, this.chapterNumber);
      console.log('Getting incorrect sections');
      this.incorrectSections = await this.quizService.getIncorrectSections(this.studentName, this.bookId, this.chapterNumber);
      console.log('Saving quiz results');
      await this.saveQuizResults();
    }catch(error){
      console.error('Error finishing quiz:', error);
    }
  }

  restartQuiz() {
    if (confirm('Are you sure you want to restart the quiz? All progress will be lost.')) {
      this.quizService.clearQuizResults(this.studentName, this.bookId, this.chapterNumber);
      this.currentSectionIndex = 0;
      this.updateCurrentSection();
      this.timer = 0;
      this.incorrectSections = [];
      this.quizStarted = false;
      this.quizFinished = false;
      this.startQuiz();
    }
  }

 async showReport() {
    if (this.isPartialMode) {
      // Navigate back to the quiz list without saving results
      this.router.navigate(['/quiz-list', this.category, this.bookId]);
    } else {
      // Save results and show report   
      await this.finishQuiz();
      this.stopTimer();
      this.quizDuration = this.timer;
      if (this.studentName && this.bookId) {
      this.router.navigate(['/quiz-report', this.category, this.bookId, this.chapterNumber, this.studentName], {
        state: {
          startTime: this.quizStartTime,
          duration: this.quizDuration
          }
        });
      } 
    }
  }

  async downloadReport() {
    const doc = new jsPDF();

    const results = await this.quizService.getDetailedQuizResults(this.studentName, this.bookId, this.chapterNumber);
    
    doc.text(`Quiz Report for ${this.studentName}`, 10, 10);
    doc.text(`Book: ${this.bookId}, Chapter: ${this.chapterNumber}`, 10, 20);
    doc.text(`Score: ${this.quizScore.correct} / ${this.quizScore.total}`, 10, 30);
    doc.text(`Time taken: ${this.formatTime(this.timer)}`, 10, 40);

    let yPos = 50;
    Object.entries(results).forEach(([index, result]) => {
      doc.text(`Question ${index + 1}: ${result.correct ? 'Correct' : 'Incorrect'}`, 10, yPos);
      yPos += 10;
    });

    doc.save(`quiz_report_${this.bookId}_${this.chapterNumber}.pdf`);
  }

  private async  saveQuizResults() {
    console.log('Saving quiz results for: ', this.studentName, this.bookId, this.chapterNumber);
    const detailedResults =  await this.quizService.getDetailedQuizResults(toCamelCase(this.studentName), this.bookId, this.chapterNumber);
    const results = {
      studentName: this.studentName,
      bookId: this.bookId,
      chapterNumber: this.chapterNumber,
      score: this.quizScore,
      timeTaken: this.timer,
      startTime: this.quizStartTime,
      incorrectSections: this.incorrectSections,
      detailedResults: detailedResults
    };
    localStorage.setItem(`quizResults_${this.bookId}_${this.chapterNumber}_${toCamelCase(this.studentName)}`, JSON.stringify(results));
  }

  startTimer() {
    this.timerSubscription = interval(1000).subscribe(() => {
      this.timer++;
    }); 
  }

  stopTimer() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    } else {
      return `${minutes < 10 ? '0' : ''}${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }
  }

  previousSection() {
    if (this.currentSectionIndex > 0) {
      this.currentSectionIndex--;
      this.updateCurrentSection();
    }
  }

  changeName() {
    this.tempStudentName = this.studentName;    
    this.studentName = '';
    this.showNameInput = true;
    this.quizStarted = false;
    this.stopTimer();        
  }

  setStudentName() {
    this.studentName = this.tempStudentName.trim();
    localStorage.setItem('studentName', this.studentName);
    this.showNameInput = false;
    this.startQuiz();
  }

  async exitQuiz() {          
  
    console.log('Navigating to quiz list: ', this.category, this.bookId);
      this.router.navigate(['/quiz-list', this.category, this.bookId]);

  }

  
}
