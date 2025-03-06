import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { toCamelCase } from '../../../core/utils/string-utils';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { v4 as uuidv4 } from 'uuid';
import { QuizService } from '../../../services/quiz.service';
import { ContentService } from '../../../services/content.service';


@Component({
  selector: 'cr-quiz-report',
  standalone: true,
  imports: [CommonModule],
  template: `
  
    <div class="report-container pb-5" id="reportContent">  
        <div class="text-left">
          <img *ngIf="bookCoverUrl" [src]="bookCoverUrl" alt="Book Cover" class="book-cover mx-auto d-block">
          <div class="p-4 card shadow-sm mb-4">
            <h5 class="mb-3 text-primary">Assessment Report</h5>
            <h6 class="mb-2 text-secondary">{{ bookTitle }}</h6>
            <h6  class="mb-3 text-muted">{{ chapterName }}</h6>
            <p class="h5 mb-0 text-dark"><span class="font-weight-bold">{{ studentName }}</span></p>
          </div>

      <div class="card shadow-sm mb-4 p-1">
        <div class="card-body">          
          <div class="score-badge mb-3 mt-2 p-3 d-flex justify-content-center" [ngClass]="getScoreClass()">
            Score: {{ quizScore.correct }} / {{ quizScore.total }} 
            <span class="percentage-score"> &nbsp; ({{ (quizScore.correct / quizScore.total * 100).toFixed(1) }}%)</span>
          </div>
          
          <div class="quiz-meta">
            <p><strong>Started:</strong> {{ quizStartTime | date:'medium' }}</p>
            <p><strong>Duration:</strong> {{ formatDuration(quizDuration) }}</p>
          </div>
        </div>
      </div>
      

      <div class="question-list" *ngIf="incorrectAndUnattemptedResults.length > 0">
        <h5>Incorrect and Unattempted Questions</h5>
        <hr>
        <div *ngFor="let result of incorrectAndUnattemptedResults; let i = even" class="question-result" [ngClass]="{'even-row': i}">
        
          <p class="question-text"><strong>Question {{ result.index }} :</strong> </p>
          <p class="question-text">{{ result.question }}</p>
          <p><strong>Your Answer:</strong> {{ result.userAnswer }}</p>
          <p><strong>Correct Answer:</strong> {{ result.correctAnswer }}</p>
          <p><strong>Status:</strong> {{ result.attempted ? 'Incorrect' : 'Unattempted' }}</p>
          <div *ngIf="result.solution" class="solution">
            <h5 class="mb-2">Solution:</h5>
            <p>{{ result.solution }}</p>
          </div>
        </div>
      </div>

    
    </div>
    <div class="summary-report card shadow-sm" id="summaryReport" style="display: none;">    
      <div class="card-body">
        <div class="row align-items-center">
          <div class="col-md-4 text-center mb-3 mb-md-0">
            <img *ngIf="bookCoverUrl" [src]="bookCoverUrl" alt="Book Cover" class="img-fluid rounded shadow-sm" style="max-height: 200px;">
          </div>
          <div class="col-md-8">
            <h5 class="text-primary mb-1">{{ studentName }}</h5>
            <h6 class="text-secondary mb-1">{{ bookTitle }}</h6>
            <p class="text-muted mb-4 small">{{ chapterName }}</p>            
            <div class="row">
              <div class="col-sm-6 mb-3">
                <div class="card">
                  <div class="card-body text-center">
                    <h6 class="mb-0">Score</h6>
                    <p class="lead text-dark mb-0">{{ quizScore.correct }} / {{ quizScore.total }}</p>
                    <p class="small">({{ (quizScore.correct / quizScore.total * 100).toFixed(1) }}%)</p>
                  </div>
                </div>
              </div>
              <div class="col-sm-6" *ngIf="quizScore.total !== quizScore.correct">
                <table class="table table-striped">
                  <tbody>
                    <tr>
                      <td><strong>Correct :</strong></td>
                      <td><span class="text-success">{{ quizScore.correct }}</span></td>
                    </tr>
                    <tr>
                      <td><strong>Incorrect :</strong></td>
                      <td><span class="text-danger">{{ quizScore.total - quizScore.correct - unattemptedCount }}</span></td>
                    </tr>
                    <tr>
                      <td><strong>Unattempted :</strong></td>
                      <td><span class="text-warning">{{ unattemptedCount }}</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div class="mt-3">
              <strong>Time Taken :</strong>
              <span class="badge bg-info text-dark p-2 ms-2">{{ formatDuration(quizDuration) }}</span>
            </div>
               
              </div>
            </div>
          </div>
        </div>
      </div>
  
    <div class="fixed-bottom-actions">
      <div class="action-buttons fixed-bottom d-flex justify-content-around p-3 mt-5">
        <button class="btn btn-outline-secondary" (click)="goBackToList()">
          <i class="fas fa-chevron-left"></i> Back
        </button>
        <button class="btn btn-primary" (click)="generateAndDownloadPDF()">
          <i class="fas fa-download"></i> Download
        </button>
        <button class="btn btn-success" (click)="shareViaWhatsApp()">
          <i class="fab fa-whatsapp"></i> Share
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./quiz-report.component.scss']
})
export class QuizReportComponent implements OnInit {
  bookId    = '';    
  chapterNumber = 0;
  chapterName = '';
  studentName = ''; 
  bookTitle = '';
  bookCoverUrl: string | null = null;
  quizResults: { [index: number]: any } | null = null;
  quizScore: { correct: number, total: number } = { correct: 0, total: 0 };
  incorrectAndUnattemptedResults: any[] = [];
  quizStartTime: Date | null = null;
  quizDuration = 0;
  pdfBlob: Blob | null = null;
  reportId = uuidv4();
  unattemptedCount = 0;
  percentageScore = 0;
  quizResultsMeta: { [key: string]: any } = {};
  category = 'apt';
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quizService: QuizService,
    private contentService: ContentService
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation && navigation.extras.state) {
      this.quizStartTime = navigation.extras.state['startTime'];
      this.quizDuration = navigation.extras.state['duration'];
    }
  }

  async ngOnInit() {
    this.route.params.subscribe(async params => {
      this.bookId = params['bookId'];
      this.chapterNumber = parseInt(params['partId']) ;
      this.studentName = localStorage.getItem('studentName') || '';

      console.log('Loading quiz report for: ', this.studentName, this.bookId, this.chapterNumber);
      await this.loadQuizResults();
      await this.loadBookDetails();
    });
    this.calculateUnattemptedCount();
    this.calculatePercentageScore();
  }

  async loadQuizResults() {
    if (this.studentName && this.bookId) {
      const camelCaseStudentName = toCamelCase(this.studentName);
      console.log('Loading quiz results for: ', camelCaseStudentName, this.bookId, this.chapterNumber);
      this.quizResults = await this.quizService.getDetailedQuizResults(camelCaseStudentName, this.bookId, this.chapterNumber);
      this.quizResultsMeta = await this.quizService.getQuizResultsMetaFromStorage(camelCaseStudentName, this.bookId, this.chapterNumber.toString());

      this.quizScore = await this.quizService.getQuizScore(camelCaseStudentName, this.bookId, this.chapterNumber);
      this.quizStartTime = this.quizResultsMeta['startTime'];
      this.quizDuration = this.quizResultsMeta['timeTaken'];
      
      this.processIncorrectAndUnattemptedResults();
    } else {
      console.error('Student name or book ID is missing');

    }
  }

  processIncorrectAndUnattemptedResults() {
    if (this.quizResults) {
      this.incorrectAndUnattemptedResults = Object.entries(this.quizResults)
        .filter(([_, result]) => !result.correct || !result.attempted)
        .map(([index, result]) => ({
          index: parseInt(index) + 1,
          question: result.question,
          userAnswer: result.userAnswer,
          correctAnswer: result.correctAnswer,
          solution: result.solution,
          attempted: result.attempted
        }));
    }
  }

  async loadBookDetails() {
    const bookMetadata = await this.contentService.getCurrentMetadata();
    if (bookMetadata) {
      this.bookTitle = bookMetadata.title;
      this.bookCoverUrl = bookMetadata.coverImage;
      this.chapterName = bookMetadata.partsMetadata[this.chapterNumber - 1].title;
    }
  }

  getScoreClass(): string {
    const percentage = (this.quizScore.correct / this.quizScore.total) * 100;
    if (percentage >= 90) return 'score-excellent';
    if (percentage >= 75) return 'score-good';
    if (percentage >= 60) return 'score-average';
    return 'score-poor';
  }

  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} minutes ${remainingSeconds} seconds`;
  }



  async generatePDF() : Promise<{ pdf: jsPDF, imgData: string } | null> {
    const reportContent = document.getElementById('reportContent');
    if (!reportContent) return null;

    // Hide the fixed bottom actions
    const fixedBottomActions = document.querySelector('.fixed-bottom-actions') as HTMLElement;
    if (fixedBottomActions) {
      fixedBottomActions.style.display = 'none';
    }

    const canvas = await html2canvas(reportContent, {
      scale: 2,
      logging: false,
      useCORS: true,
      ignoreElements: (element) => element.classList.contains('fixed-bottom-actions')
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: [canvas.width / 4, canvas.height / 4] // Adjust the size as needed
    });

    pdf.addImage(imgData, 'JPEG', 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());

    // Show the fixed bottom actions again
    if (fixedBottomActions) {
      fixedBottomActions.style.display = '';
    }

    const pdfName = `Quiz_Report_${this.studentName}_${this.chapterName}_${uuidv4()}.pdf`;
    pdf.save(pdfName);

    return { pdf, imgData };
  }

  async generateAndDownloadPDF() {
    const result = await this.generatePDF();
    if (result) {
      const { pdf, imgData } = result;
      this.pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(this.pdfBlob);
      window.open(pdfUrl, '_blank');

      // Save the PDF blob with the reportId
      localStorage.setItem(`pdf_${this.reportId}`, await this.blobToBase64(this.pdfBlob));

      // Save the JPEG image
      this.saveJPEG(imgData);
    }
  }

  saveJPEG(imgData: string) {
    const link = document.createElement('a');
    link.href = imgData;
    link.download = `Quiz_Report_${this.studentName}_${this.chapterName}_${uuidv4()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  calculateUnattemptedCount() {
    this.unattemptedCount = this.quizScore.total - this.quizScore.correct - 
      (this.incorrectAndUnattemptedResults.filter(r => r.attempted).length);
  }

  async shareViaWhatsApp() {
    const summaryImage = await this.generateSummaryImage();
    this.shareSummaryImage(summaryImage);
  }

  async generateSummaryImage(): Promise<string> {
    const summaryElement = document.getElementById('summaryReport');
    if (!summaryElement) throw new Error('Summary report element not found');

    summaryElement.style.display = 'block';
    const canvas = await html2canvas(summaryElement, {
      scale: 2,
      logging: false,
      useCORS: true
    });
    summaryElement.style.display = 'none';

    return canvas.toDataURL('image/jpeg', 0.8);
  }

  shareSummaryImage(imageDataUrl: string) {
    if (navigator.share) {
      fetch(imageDataUrl)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], 'quiz_summary.jpg', { type: 'image/jpeg' });
          navigator.share({
            files: [file],
            title: 'Quiz Summary',
            text: 'Check out my quiz summary!'
          }).then(() => {
            console.log('Shared successfully');
          }).catch((error) => {
            console.error('Error sharing:', error);
            this.fallbackShare(imageDataUrl);
          });
        });
    } else {
      this.fallbackShare(imageDataUrl);
    }
  }

  fallbackShare(imageDataUrl: string) {
    // Create a temporary anchor element
    const tempLink = document.createElement('a');
    tempLink.href = imageDataUrl;
    tempLink.download = 'quiz_summary.jpg';
    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);

    // Open WhatsApp with a pre-filled message
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent('Check out my quiz summary! (Image attached)')}`;
    window.open(whatsappUrl, '_blank');
  }

  calculatePercentageScore() {
    if (this.quizScore.total !== 0) {
      this.percentageScore = Math.round((this.quizScore.correct / this.quizScore.total) * 100);
    } else {
      this.percentageScore = 0;
    }
    console.log('Quiz Score:', this.quizScore);
    console.log('Percentage Score:', this.percentageScore);
  }

  goBackToList() {
    this.router.navigate(['/quiz-list',this.category, this.bookId]);
  }
}
