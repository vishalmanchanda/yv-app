import { Injectable } from '@angular/core';
import { toCamelCase } from '../core/utils/string-utils';
import { ContentService } from './content.service';


interface QuizResult {
  question: string;
  correct: boolean;
  userAnswer: string;
  correctAnswer: string;
  solution?: string;
  attempted: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private readonly STORAGE_KEY_PREFIX = 'quiz_';
  constructor(private contentService: ContentService) {}

  recordAnswer(studentName: string, bookId: string, partId: number, questionIndex: number, question: string, isCorrect: boolean, userAnswer: string, correctAnswer: string, solution?: string) {
    const key = this.getStorageKey(studentName, bookId, partId);
    const quizData = this.getQuizData(studentName, bookId, partId);
    quizData[questionIndex] = { question, correct: isCorrect, userAnswer, correctAnswer, solution, attempted: true };
    localStorage.setItem(key, JSON.stringify(quizData));
  }

  isQuizCompleted(username: string, bookId: string, partId: number): boolean {
    const quizData = this.getQuizData(username, bookId, partId);
    return Object.keys(quizData).length > 0;
  }

  async getQuizScore(studentName: string, bookId: string, partId: number): Promise<{ correct: number, total: number }> {
    const quizData = this.getQuizData(studentName, bookId, partId);
    console.log('Quiz data:', quizData);
    const total = await this.getTotalQuestions(bookId, partId);
    console.log('Total questions:', total);
    const correct = Object.values(quizData).filter(result => result.correct).length;
    console.log('Correct answers:', correct);
    return { correct, total };
  }

  clearQuizResults(studentName: string, bookId: string, partId: number) {
    const key = this.getStorageKey(studentName, bookId, partId);
    localStorage.removeItem(key);
  }

  async getIncorrectSections(username: string, bookId: string, partId: number): Promise<number[]> {
    const quizData = this.getQuizData(username, bookId, partId);
    const totalQuestions = await this.getTotalQuestions(bookId, partId);
    
    return Array.from({ length: totalQuestions }, (_, index) => index)
      .filter(index => !quizData[index] || !quizData[index].correct);
  }

  async getDetailedQuizResults(studentName: string, bookId: string, partId: number): Promise<{ [index: number]: QuizResult }> {
    const quizData = await this.getQuizData(studentName, bookId, partId);
    console.log('Part ID: ', partId);
    const part = await this.contentService.getPart(partId);
    console.log('Part: ', part);
    
    const detailedResults: { [index: number]: QuizResult } = {};
    const chapterContent = part?.sections || [];
    for (let i = 0; i < chapterContent.length; i++) {
      if (quizData[i]) {
        detailedResults[i] = quizData[i];
      } else {
        detailedResults[i] = {
          question: chapterContent[i].passage!,
          correct: false,
          userAnswer: '--',
          correctAnswer: chapterContent[i].meaning?.split('~').slice(-1)[0] || '',
          solution: chapterContent[i].commentary || '',
          attempted: false
        };
      }
    }
    return detailedResults;
  }

  private getStorageKey(studentName: string, bookId: string, partId: number): string {
    return `${this.STORAGE_KEY_PREFIX}${toCamelCase(studentName)}_${bookId}_${partId}`;
  }

  private getQuizData(studentName: string, bookId: string, partId: number): { [questionIndex: number]: QuizResult } {
    const key = this.getStorageKey(studentName, bookId, partId);
    console.log('Key for quiz data: ', key);
    const storedData = localStorage.getItem(key);
    return storedData ? JSON.parse(storedData) : {};
  }



  private async getTotalQuestions(bookId: string, partId: number): Promise<number> {
    const part = await this.contentService.getPart(partId);
    return part?.sections?.length || 0;
  }

  getQuizResultsMetaFromStorage(studentName: string, bookId: string, chapterId: string): { [key: string]: any } {
    const key = `quizResults_${bookId}_${chapterId}_${toCamelCase(studentName)}`;
    const storedData = localStorage.getItem(key);
    return storedData ? JSON.parse(storedData) : {};
  }
}
