import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TruncatePipe } from "../../utils/string-utils";
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

interface GenericNavbarAction {
  icon: string;
  label: string;
  click: () => void;
}

@Component({
  standalone: true,
  imports: [CommonModule, TruncatePipe, NgbDropdownModule],
  selector: 'app-generic-navbar',
  template: `
    <nav class="navbar generic-navbar navbar-expand-lg border-bottom fixed-top" scrollHide>
      <div class="container-fluid d-flex d-inline-block justify-content-between">
        <a class="navbar-brand" href="#" (click)="leadingActionClick(); $event.preventDefault();">
          <span class="text-truncate" style="text-overflow: ellipsis; overflow: visible; display: inline-block">
            <i [class]="leadingActionIcon"></i> &nbsp; {{ title | truncate: 20 }}
          </span>
        </a>

        <div class="d-flex align-items-center gap-3 ms-auto">
          <button *ngFor="let action of actions" 
                  class="btn btn-link text-secondary px-2" 
                  (click)="action.click()">
            <i [class]="action.icon"></i>
          </button>

          <div class="dropdown" ngbDropdown display="dynamic" placement="bottom-end">
            <button class="btn btn-link text-secondary px-2" 
                    id="actionDropdown" 
                    ngbDropdownToggle>
              <i class="fas fa-ellipsis-v"></i>
            </button>
            <div class="dropdown-menu dropdown-menu-end shadow-sm" 
                 ngbDropdownMenu 
                 aria-labelledby="actionDropdown">
              <ng-container *ngFor="let action of dropdownActions">
                <label *ngIf="action.type === 'file-input'" class="dropdown-item cursor-pointer">
                  <i [class]="action.icon" class="me-2"></i>
                  {{ action.label }}
                  <input type="file" class="d-none" (change)="action.click($event)">
                </label>
                <a *ngIf="action.type === 'link'" class="dropdown-item" [href]="action.link">
                  <i [class]="action.icon" class="me-2"></i>
                  {{ action.label }}
                </a>
              </ng-container>
            </div>
          </div>
        </div>
      </div>
    </nav>
  `,
  styleUrls: ['./generic-navbar.component.scss']
  
})
export class GenericNavbarComponent {
  @Input() title = '';
  @Input() leadingActionIcon = 'fas fa-chevron-left';
  @Input() leadingActionClick: () => void = () => null;
  @Input() actions: GenericNavbarAction[] = [];
  @Input() dropdownActions: (
    { type: 'file-input', icon: string, label: string, click: (event: any) => void } |
    { type: 'link', icon: string, label: string, link: string }
  )[] = [];

  @Output() fileSelected: EventEmitter<File> = new EventEmitter<File>();

  onFileSelected(event: any) {
    this.fileSelected.emit(event.target.files[0]);
  }
}