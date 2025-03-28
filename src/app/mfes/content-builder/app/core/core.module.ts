import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { ToastComponent } from '../../../content-renderer/shared/components/toast/toast.component';
import { ModalComponent } from '../../../content-renderer/shared/components/modal/modal.component';


@NgModule({
  imports: [
    CommonModule,
    RouterModule,

    NavbarComponent,
    ToastComponent,
    ModalComponent

  ],
  exports: [
    NavbarComponent,
    ToastComponent,
    ModalComponent

  ]
})
export class CoreModule { }
