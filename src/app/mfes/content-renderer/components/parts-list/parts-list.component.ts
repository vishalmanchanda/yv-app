import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PartMetadata } from '../../../../core/models/content.models';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'cr-parts-list',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="container">
    <div class="modal-header">
      <h4 class="modal-title">Table of Contents</h4>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()" aria-label="Close">
      </button>
    </div>
    <div class="modal-body">
      <div class="list-group parts-list">
        <div *ngFor="let part of parts"
             class="list-group-item list-group-item-action p-3 h5 border-1"
             [class.active]="part.id === currentPartId"
             (click)="selectPart(part.id)" 
             tabindex="0"
             role="button"
             (keydown.enter)="selectPart(part.id)">
          <span class="part-number">{{part.id}}. </span>
          <span class="part-title">{{part.title}}</span>
        </div>
      </div>
    </div>
  </div>
  `,
  styleUrls: ['./parts-list.component.scss']
})
export class PartsListComponent {
  @Input() parts: PartMetadata[] = [];
  @Input() currentPartId?: number;
  @Output() partSelected = new EventEmitter<number>();

  constructor(public activeModal: NgbActiveModal) {}

  selectPart(partId: number) {
    this.partSelected.emit(partId);
    this.activeModal.close();
  }
}