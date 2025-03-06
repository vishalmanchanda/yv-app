import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReaderComponent } from "./components/reader/reader.component";

@Component({
  selector: 'cr-content-renderer',
  standalone: true,
  imports: [CommonModule, ReaderComponent],
  templateUrl: './content-renderer.component.html',
  styleUrl: './content-renderer.component.scss',
})
export class ContentRendererComponent {}
