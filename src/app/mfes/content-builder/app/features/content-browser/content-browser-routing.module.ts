import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BrowserComponent } from './components/browser/browser.component';

const routes: Routes = [
  {
    path: '',
    component: BrowserComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContentBrowserRoutingModule { }
