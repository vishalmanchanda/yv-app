import { Routes } from '@angular/router';
import { ShellLayoutComponent } from './layouts/shell-layout/shell-layout.component';
import { AuthGuard } from './core/auth/auth.guard';
import { routes as contentViewerRoutes } from './mfes/content-viewer/app/app.routes';
import { importProvidersFrom } from '@angular/core';
import { FirebaseModule } from './mfes/content-builder/app/firebase.module';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    component: ShellLayoutComponent,    
    //canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'content-viewer',
        pathMatch: 'full'
      },
      {
        path: 'content-builder',
        //canActivate: [AuthGuard],
        data: { breadcrumb: 'Content Builder' },
        children: [
          {
            path: '',
            loadComponent: () => import('./mfes/content-builder/app/features/content-browser/components/browser/browser.component').then(m => m.BrowserComponent),
            data: { breadcrumb: 'Browser' }
          },
          {
            path: 'browser',
            loadComponent: () => import('./mfes/content-builder/app/features/content-browser/components/browser/browser.component').then(m => m.BrowserComponent),
            providers: [
              importProvidersFrom(FirebaseModule)
            ],
            data: { breadcrumb: 'Browser' }
          },
          {
            path: 'content',
            loadChildren: () => import('./mfes/content-builder/app/features/content-creation/content-creation.module')
              .then(m => m.ContentCreationModule),
            data: { breadcrumb: 'Content' }
          },
          {
            path: 'editor/:id',
            loadComponent: () => import('./mfes/content-builder/app/features/content-editor/components/editor/editor.component').then(m => m.EditorComponent),
            data: { breadcrumb: 'Editor' }
          },
          {
            path: 'renderer/:id',
            loadComponent: () => import('./mfes/content-renderer/components/reader/reader.component').then(m => m.ReaderComponent),
            data: { breadcrumb: 'Renderer' }
          },
          {
            path: 'preview/:id',
            loadComponent: () => import('./mfes/content-builder/app/features/content-preview/content-preview.component').then(m => m.ContentPreviewComponent),
            data: { breadcrumb: 'Preview', hideBreadcrumb: true }
          }
        ]
      }, 
      {
        path: 'chat',
        loadComponent: () => import('./components/chat/chat.component').then(m => m.ChatComponent),
        //canActivate: [AuthGuard],
        data: { breadcrumb: 'Chat', hideBreadcrumb: true }
      },
      {
        path: 'chatbot',
        loadComponent: () => import('./mfes/chatbot/chatbot-mfe.component').then(m => m.ChatbotMfeComponent),
        //canActivate: [AuthGuard],
        data: { breadcrumb: 'Chatbot' }
      },
      {
        path: 'content-viewer',        
        children: [
          {
            path: '',
            loadComponent: () => import('./mfes/content-viewer/app/components/home/home.component').then(m => m.HomeComponent),            
            data: { 
              breadcrumb: '',
              icon: ''
            }
          },
          {
            path: 'category/:key',
            loadComponent: () => import('./mfes/content-viewer/app/components/content-loader/content-loader.component').then(m => m.ContentLoaderComponent)
          },
          {
            path: 'home',
            loadComponent: () => import('./mfes/content-viewer/app/components/home/home.component').then(m => m.HomeComponent)
          },
          {
            path: 'home/:key',
            loadComponent: () => import('./mfes/content-viewer/app/components/home/home.component').then(m => m.HomeComponent)
          },
          {
            path: 'reader',
            loadComponent: () => import('./mfes/content-renderer/components/reader/reader.component').then(m => m.ReaderComponent),
            data: { partId: '1', sectionId: '1',
              breadcrumb: 'Reader',
              icon: 'bi-book',
              hideBreadcrumb: true
             }
          },
          {
            path: 'content/:locale/:category/:contentId',
            loadComponent: () => import('./mfes/content-renderer/components/reader/reader.component').then(m => m.ReaderComponent),
            
          },
          {
            path: 'content/:locale/:category/:contentId/:partId/:sectionId',
            loadComponent: () => import('./mfes/content-renderer/components/reader/reader.component').then(m => m.ReaderComponent),
            data: { 
              hideBreadcrumb: true
            }
          },
          {
            path: 'settings',
            loadComponent: () => import('./mfes/content-viewer/app/components/settings/settings.component').then(m => m.SettingsComponent)
          },
          {
            path: 'search',
            loadComponent: () => import('./mfes/content-renderer/components/search/search.component').then(m => m.SearchComponent)
          },
          {
            path: 'quiz-list/:category/:bookId',
            loadComponent: () => import('./mfes/content-renderer/components/quiz/quiz-list/quiz-list.component').then(m => m.QuizListComponent)
          },
          {
            path: 'quiz-viewer/:category/:bookId/:partId',
            loadComponent: () => import('./mfes/content-renderer/components/quiz/quiz-viewer/quiz-viewer.component').then(m => m.QuizViewerComponent)
          },
          {
            path: 'quiz-report/:category/:bookId/:partId/:studentName',
            loadComponent: () => import('./mfes/content-renderer/components/quiz/quiz-report/quiz-report.component').then(m => m.QuizReportComponent)
          },
          

        ],
        data: { 
          breadcrumb: 'Content',
          icon: 'bi-puzzle'
        }
      
      },
      {
        path: 'category/:key',
        redirectTo: 'content-viewer/category/:key',
        pathMatch: 'full'
      },
      {
        path: 'reader',
        redirectTo: 'content-viewer/reader',
        pathMatch: 'full'
      },
      {
        path: 'content/:locale/:category/:contentId',
        redirectTo: 'content-viewer/content/:locale/:category/:contentId',
        pathMatch: 'full'
      },
      {
        path: 'quiz-list/:category/:bookId',
        redirectTo: 'content-viewer/quiz-list/:category/:bookId',
        pathMatch: 'full'
      },
      {
        path: 'quiz-viewer/:category/:bookId/:partId',
        redirectTo: 'content-viewer/quiz-viewer/:category/:bookId/:partId',
        pathMatch: 'full'
      },
      {
        path: 'quiz-report/:category/:bookId/:partId/:studentName',
        redirectTo: 'content-viewer/quiz-report/:category/:bookId/:partId/:studentName',
        pathMatch: 'full'
      },
      {
        path: 'about',
        loadComponent: () => import('./components/about/about.component').then(m => m.AboutComponent)
      },
      {
        path: 'hackathons',
        children: [
          {
            path: '',
            loadComponent: () => import('./components/hackathons/hackathons.component')
              .then(m => m.HackathonsComponent),
            data: { 
              breadcrumb: 'Hackathons',
              icon: 'bi-trophy'
            }
          },
          {
            path: ':id',
            loadComponent: () => import('./components/hackathon-details/hackathon-details.component')
              .then(m => m.HackathonDetailsComponent),
            data: { 
              breadcrumb: 'Hackathon Details',
              icon: 'bi-info-circle'
            }
          }
        ]
      }
    ]
  },
  {
    path: 'home',
    redirectTo: 'content-viewer',
    pathMatch: 'full'
  },
  {
    path: 'error',
    loadComponent: () => import('./features/error/error.component').then(m => m.ErrorComponent)
  },
  {
    path: '404',
    loadComponent: () => import('./features/error/error.component').then(m => m.ErrorComponent),
    data: { code: '404' }
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
    //canActivate: [AuthGuard],
    data: { breadcrumb: 'Profile' }
  },
  {
    path: 'settings',
    loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent),
    //canActivate: [AuthGuard],
    data: { breadcrumb: 'Settings' }
  },
  {
    path: 'content/:locale/:category/:contentId/:partId/:sectionId',
    redirectTo: 'content-viewer/content/:locale/:category/:contentId/:partId/:sectionId',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '404'
  }
];
