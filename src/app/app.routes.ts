import { Routes } from '@angular/router';
import { ShellLayoutComponent } from './layouts/shell-layout/shell-layout.component';
import { AuthGuard } from './core/auth/auth.guard';
import { routes as contentViewerRoutes } from './mfes/content-viewer/app/app.routes';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    component: ShellLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'content-viewer',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
        data: { 
          breadcrumb: 'Dashboard',
          icon: 'bi-speedometer2'
        }
      },
      {
        path: 'chat',
        loadComponent: () => import('./components/chat/chat.component').then(m => m.ChatComponent),
        canActivate: [AuthGuard],
        data: { breadcrumb: 'Chat' }
      },
      {
        path: 'chatbot',
        loadComponent: () => import('./mfes/chatbot/chatbot-mfe.component').then(m => m.ChatbotMfeComponent),
        canActivate: [AuthGuard],
        data: { breadcrumb: 'Chatbot' }
      },
      {
        path: 'users',
        loadComponent: () => import('./features/user-management/user-management.component').then(m => m.UserManagementComponent),
        data: { 
          breadcrumb: 'User Management',
          icon: 'bi-people'
        }
      },
      {
        path: 'features',
        loadComponent: () => import('./features/features-display/features-display.component').then(m => m.FeaturesDisplayComponent),
        data: { 
          breadcrumb: 'Features',
          icon: 'bi-list-check'
        }
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
             }
          },
          {
            path: 'content/:locale/:category/:contentId',
            loadComponent: () => import('./mfes/content-renderer/components/reader/reader.component').then(m => m.ReaderComponent),
            
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
    canActivate: [AuthGuard],
    data: { breadcrumb: 'Profile' }
  },
  {
    path: 'settings',
    loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent),
    canActivate: [AuthGuard],
    data: { breadcrumb: 'Settings' }
  },
  {
    path: '**',
    redirectTo: '404'
  }
];
