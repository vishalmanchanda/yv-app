import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NewContentComponent } from './components/new-content/new-content.component';
import { SimpleFormComponent } from './components/simple-form/simple-form.component';
import { AIAssistedFormComponent } from './components/ai-assisted-form/ai-assisted-form.component';
import { PromptTabsComponent } from './components/prompt-tabs/prompt-tabs.component';
import { BottomToolbarComponent } from './components/bottom-toolbar/bottom-toolbar.component';
import { ContentFormComponent } from './components/content-form/content-form.component';
import { FirebaseModule } from '../../firebase.module';

const routes: Routes = [
  {
    path: 'new',
    component: NewContentComponent
  }
];

@NgModule({
  declarations: [

  ],
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    FirebaseModule
  ]
})
export class ContentCreationModule { } 