import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EditorComponent } from './features/content-editor/components/editor/editor.component';
const routes: Routes = [
  {
    path: '',
    redirectTo: 'browser',
    pathMatch: 'full'
  },
  {
    path: 'browser',
    loadChildren: () => import('./features/content-browser/content-browser.module')
      .then(m => m.ContentBrowserModule)
  },
  {
    path: 'editor',
    children: [
      {
        path: ':id',
        component: EditorComponent
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'browser'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { } 