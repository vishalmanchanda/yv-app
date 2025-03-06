import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastContainerComponent } from './shared/components/toast-container/toast-container.component';
import { LoadingSpinnerComponent } from './shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastContainerComponent, LoadingSpinnerComponent],
  template: `
    <router-outlet></router-outlet>
    <app-toast-container></app-toast-container>
    <app-loading-spinner></app-loading-spinner>
  `
})
export class AppComponent {
  title = 'yv-app';
}
