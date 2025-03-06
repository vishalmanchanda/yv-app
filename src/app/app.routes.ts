import { Routes } from '@angular/router';
import { ShellLayoutComponent } from './layouts/shell-layout/shell-layout.component';
import { AuthGuard } from './core/auth/auth.guard';

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
        redirectTo: 'dashboard',
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
        path: 'mfe1',
        loadComponent: () => import('./mfes/mfe1/example.component').then(m => m.ExampleComponent),
        data: { 
          breadcrumb: 'MFE Example',
          icon: 'bi-puzzle'
        }
      },
      {
        path: 'docs',
        loadComponent: () => import('./mfes/docs/documentation.component')
          .then(m => m.DocumentationComponent),
        data: { 
          breadcrumb: 'Documentation',
          icon: 'bi-book'
        }
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
