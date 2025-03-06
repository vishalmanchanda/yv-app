import { ActivatedRouteSnapshot, Routes } from '@angular/router';

import { SettingsComponent } from './components/settings/settings.component';
import { HomeComponent } from './components/home/home.component';

// import { ReaderComponent } from './components/reader/reader.component';

import { ContentLoaderComponent } from './components/content-loader/content-loader.component';
import { HackathonsComponent } from './components/hackathons/hackathons.component';
import { ReaderComponent } from '../../content-renderer/components/reader/reader.component';
import { SearchComponent } from '../../content-renderer/components/search/search.component';
import { QuizListComponent } from '../../content-renderer/components/quiz/quiz-list/quiz-list.component';
import { QuizViewerComponent } from '../../content-renderer/components/quiz/quiz-viewer/quiz-viewer.component';
import { QuizReportComponent } from '../../content-renderer/components/quiz/quiz-report/quiz-report.component';




export const routes: Routes = [
  { path: '', component: HomeComponent },
  { 
    path: 'category/:key', 
        component: ContentLoaderComponent,  
  },
  
  
  { path: 'home', component: HomeComponent },
  { path: 'home/:key', component: HomeComponent },
  { path: 'reader', component: ReaderComponent, data: { partId: '1', sectionId: '1' } },
  { path: 'content/:locale/:category/:contentId', component: ReaderComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'search', component: SearchComponent },
  { path: 'quiz-list/:category/:bookId', component: QuizListComponent },
  { path: 'quiz-viewer/:category/:bookId/:partId', component: QuizViewerComponent },
  { path: 'quiz-report/:category/:bookId/:partId/:studentName', component: QuizReportComponent },

  { path: 'hackathons', component: HackathonsComponent },

  { path: '**', redirectTo: '' }
];
