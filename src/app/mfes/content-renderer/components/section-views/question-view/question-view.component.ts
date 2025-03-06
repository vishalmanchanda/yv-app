import { Component, Input, ChangeDetectorRef, Output, EventEmitter, ElementRef, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

import { QuizService } from '../../../services/quiz.service';


import { MarkdownModule } from 'ngx-markdown';
import { toCamelCase } from '../../../core/utils/string-utils';
import { BaseSectionViewComponent } from '../base-section-view.component';
import { ISectionViewComponent } from '../../../models/section-view.interface';

import { SectionViewService } from '../../../services/section-view.service';
import { ContentService } from '../../../services/content.service';

@Component({
  selector: 'cr-question-view',
  standalone: true,
  imports: [CommonModule, MarkdownModule],
  template: `
    <div class="mcq-section" [ngClass]="currentTheme">
     
      <div class="text-muted small">{{ section.title }}</div>
      <div class="question mb-4">{{ section.passage }}</div>
     
      <div class="options">
        <button *ngFor="let option of options; let i = index" 
                class="btn mb-3 w-100 text-start option-button"
                [ngClass]="{
                  'btn-outline-primary': selectedOption !== i && !isAnswerSubmitted,
                  'btn-success': (isAnswerSubmitted && i === correctAnswerIndex) || (selectedOption === i && isCorrect),
                  'btn-danger': isAnswerSubmitted && selectedOption === i && i !== correctAnswerIndex,
                  'btn-primary': !isAnswerSubmitted && selectedOption === i
                }"
                (click)="selectOption(i)"
                [disabled]="isAnswerSubmitted">
          <span class="option-number">{{ i + 1 }}.</span> {{ option }}
        </button>
      </div>
      <div *ngIf="selectedOption !== -1 && section.commentary" class="mt-4 d-flex justify-content-end">
        <button class="btn btn-sm btn-outline-secondary" (click)="toggleSolution()">
          {{ showSolution ? 'Hide' : 'Show' }} Solution
        </button>
      </div>
      <div *ngIf="showSolution" class="solution mt-3">
        <markdown [data]="section.commentary"></markdown>
      </div>
      <!-- <div *ngIf="section.type === 'question' && !isAnswerSubmitted" class="mt-4">
        <button class="btn btn-primary btn-lg" (click)="submitAnswer()" [disabled]="selectedOption === -1">Submit Answer</button>
      </div>
      <div class="mb-2"></div>
      <div *ngIf="isAnswerSubmitted && isLastQuestion && isPractice" class="mt-4 text-center">
        <hr>
        <h4>Practice Completed!</h4>
        <p>Your score: {{ quizScore.correct }} out of {{ index + 1 }}</p>
        <button class="btn btn-primary btn-lg" (click)="attemptAgain()">Attempt Again</button>
      </div> -->
    </div>
  `,
  styleUrls: ['./question-view.component.scss']
  
})
export class QuestionViewComponent extends BaseSectionViewComponent implements ISectionViewComponent, OnInit, OnChanges {

  @Input() index = 0;   
  @Input() currentTheme = 'light-theme';
  @Input() isLastQuestion = false;
  @Input() studentName = '';
  @Input() bookId = '';

  @Input() isPractice = false;
  @Output() restartQuiz = new EventEmitter<void>();

  options: string[] = [];
  correctAnswerIndex = -1;
  selectedOption = -1;
  isAnswerSubmitted = false;
  imageFitContain = false;
  isCorrect = false;
  quizScore = { correct: 0, total: 0 };
  showSolution = false;
  

  constructor(
    sectionViewService: SectionViewService,
    elementRef: ElementRef,
    private quizService: QuizService,
    private cdr: ChangeDetectorRef,
    contentService: ContentService

  ) {
    super(sectionViewService, contentService, elementRef);
  }

  override ngOnInit() {
    super.ngOnInit();
    this.updateSection();

  }

  override ngOnChanges() {
    super.ngOnChanges();
    if (this.section) {
      this.updateSection();
    }
  }

  private updateSection() {
    if (this.section && this.section.meaning) {
      const allOptions = this.section.meaning.split('~');
      this.options = allOptions.slice(0, -1);
      this.correctAnswerIndex = this.options.indexOf(allOptions[allOptions.length - 1]);
      this.selectedOption = -1;
      this.isAnswerSubmitted = false;
      this.isCorrect = false;
      this.showSolution = false;
      console.log('Updated options:', this.options, 'Correct answer index:', this.correctAnswerIndex);
    } else {
      this.options = [];
      this.correctAnswerIndex = -1;
      this.selectedOption = -1;
      this.isAnswerSubmitted = false;
      this.isCorrect = false;
      this.showSolution = false;
    }
  }

  

  selectOption(index: number) {
    this.selectedOption = index;
    if (this.section?.type === 'question') {
      this.submitAnswer();
    }
  }

  async submitAnswer() {
    if (this.section && this.selectedOption !== -1) {
      this.isCorrect = this.selectedOption === this.correctAnswerIndex;
      this.recordAnswer();
      this.isAnswerSubmitted = true;

      if (this.isLastQuestion) {
        this.quizScore = await this.getQuizScore();
      }

      this.cdr.detectChanges(); // Force change detection
    }
  }

  private recordAnswer() {
    if (this.section && !this.isPractice) {
        
      if (this.studentName && this.bookId) {
        this.quizService.recordAnswer(
          toCamelCase(this.studentName),
          this.bookId,
          parseInt(this.partId),
          this.index,
          this.section.passage || '',
          this.isCorrect,
          this.options[this.selectedOption],        
          this.options[this.correctAnswerIndex],
          this.section.commentary
        );
      } 
    }
  }

  attemptAgain() {
    if (this.section) {
      if (this.studentName && this.bookId) {
        this.quizService.clearQuizResults(
          toCamelCase(this.studentName),
          this.bookId,
          parseInt(this.partId)
        );
        } 
      this.restartQuiz.emit();
    }
  }

  private async getQuizScore(): Promise<{ correct: number, total: number }> {
    if (this.studentName && this.bookId) {
      return await this.quizService.getQuizScore(
        toCamelCase(this.studentName),
        this.bookId,
        parseInt(this.partId)
      );
    } 
    return { correct: 0, total: 0 };
  }

  

  

  toggleSolution() {
    this.showSolution = !this.showSolution;
  }
}
