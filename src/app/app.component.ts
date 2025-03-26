import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastContainerComponent } from './shared/components/toast-container/toast-container.component';
import { LoadingSpinnerComponent } from './shared/components/loading-spinner/loading-spinner.component';
import { UpdateService } from './services/update.service';

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
export class AppComponent implements OnInit {
  title = 'yv-app';

  constructor(
    private updateService: UpdateService
  ) {}

  ngOnInit(): void {
    // Service will automatically check for updates
  }
}
