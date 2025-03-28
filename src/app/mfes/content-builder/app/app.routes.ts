import { Routes } from '@angular/router';

import { EditorComponent } from './features/content-editor/components/editor/editor.component';

import { ContentPreviewComponent } from './features/content-preview/content-preview.component';
import { FirebaseModule } from './firebase.module';
import { importProvidersFrom } from '@angular/core';
import { ReaderComponent } from '../../content-renderer/components/reader/reader.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'browser',
    pathMatch: 'full'
  },
  {
    path: 'browser',
    providers: [
      importProvidersFrom(FirebaseModule)
    ],
    loadChildren: () => import('./features/content-browser/content-browser.module')
      .then(m => m.ContentBrowserModule)
  },
  {
    path: 'content',
    loadChildren: () => import('./features/content-creation/content-creation.module')
      .then(m => m.ContentCreationModule)
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
    path: 'renderer',
    children: [
      {
        path: ':id',
        component: ReaderComponent
      }
    ]
  },
  {
    path: 'preview/:id',
    component: ContentPreviewComponent
  },{
    path: '**',
    redirectTo: 'browser'
  }

];