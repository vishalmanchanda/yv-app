import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ModalService, ModalConfig } from '../../../core/services/modal.service';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'cr-modal',
  template: `
    <div *ngIf="modalConfig" class="modal fade show" style="display: block;" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ modalConfig.title }}</h5>
            <button type="button" class="btn-close" (click)="close()" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>{{ modalConfig.body }}</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="close()">
              {{ modalConfig.cancelText || 'Close' }}
            </button>
            <button type="button" class="btn btn-primary" (click)="confirm()">
              {{ modalConfig.confirmText || 'Confirm' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div *ngIf="modalConfig" class="modal-backdrop fade show"></div>
  `,
  styles: []
})
export class ModalComponent implements OnInit, OnDestroy {
  modalConfig: ModalConfig | null = null;
  private subscription: Subscription = new Subscription;

  constructor(private modalService: ModalService) {}

  ngOnInit() {
    this.subscription = this.modalService.modalState$.subscribe(
      config => this.modalConfig = config
    );
  }

  close() {
    this.modalService.close();
  }

  confirm() {
    this.modalService.confirm();
    this.close();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
