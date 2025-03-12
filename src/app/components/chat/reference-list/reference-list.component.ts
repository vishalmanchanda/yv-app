import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Reference } from '../../../types/chat';

@Component({
  selector: 'app-reference-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reference-list.component.html',
  styleUrls: ['./reference-list.component.scss']
})
export class ReferenceListComponent {
  @Input() references: Reference[] = [];
  @Input() isUserMessage: boolean = false;
} 