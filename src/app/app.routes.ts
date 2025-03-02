import { Routes } from '@angular/router';
import { ShellLayoutComponent } from './layouts/shell-layout/shell-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: ShellLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'mfe1',
        loadComponent: () => import('./mfes/mfe1/example.component').then(m => m.ExampleComponent)
      }
    ]
  }
];
