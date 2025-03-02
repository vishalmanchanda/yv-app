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
    path: '**',
    redirectTo: '404'
  }
];
