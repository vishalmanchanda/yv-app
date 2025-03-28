import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';


import { NavbarComponent } from './core/components/navbar/navbar.component';
import { ToastComponent } from '../../content-renderer/shared/components/toast/toast.component'; 
import { CoreModule } from '../../../core/core.module';
import { ModalComponent } from '../../content-renderer/shared/components/modal/modal.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CoreModule, NavbarComponent, ModalComponent, ToastComponent],
  template: `
    <app-navbar></app-navbar>
    <main class="app-main">
      <router-outlet></router-outlet>
      <cr-toast></cr-toast> 
      <cr-modal></cr-modal>
    </main>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }
    
    .app-main {
      flex: 1;
      overflow: auto;
    }
  `],


})
export class AppComponent { }
