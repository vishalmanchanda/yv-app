import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from '../../content-renderer/shared/components/toast/toast.component'; 
import { ModalComponent } from '../../content-renderer/shared/components/modal/modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent, ModalComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.sass'
})
export class AppComponent {
  title = 'content-viewer';
}
