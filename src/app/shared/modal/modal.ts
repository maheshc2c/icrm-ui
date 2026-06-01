import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-backdrop" *ngIf="show" (click)="close()">
      <div class="modal-content" [ngClass]="size" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3 class="modal-title">{{ title }}</h3>
          <button class="close-btn" (click)="close()">&times;</button>
        </div>
        <div class="modal-body">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(4px);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    .modal-backdrop *, .modal-backdrop *:before, .modal-backdrop *:after {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
      box-sizing: border-box;
    }
    .modal-content {
      background: white;
      border-radius: 8px;
      width: 90%;
      box-shadow: 0 10px 25px rgba(0,0,0,0.15);
      display: flex;
      flex-direction: column;
      max-height: 90vh;
      overflow: hidden;
      border: none;
      animation: fadeIn 0.25s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.96); }
      to { opacity: 1; transform: scale(1); }
    }
    .modal-content.sm { max-width: 400px; }
    .modal-content.md { max-width: 600px; }
    .modal-content.lg { max-width: 850px; }
    .modal-content.xl { max-width: 1100px; }

    .modal-header {
      padding: 14px 20px;
      background: #2196f3;
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: none;
    }
    .modal-title {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
      font-family: inherit;
    }
    .close-btn {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: rgba(255, 255, 255, 0.85);
      line-height: 1;
      padding: 0;
      transition: color 0.2s;
    }
    .close-btn:hover {
      color: white;
    }
    .modal-body {
      padding: 20px;
      overflow-y: auto;
      background: #fdfdfd;
      font-family: inherit;
    }
  `]
})
export class ModalComponent {
  @Input() show = false;
  @Input() title = '';
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Output() closeDialog = new EventEmitter<void>();

  close() {
    this.closeDialog.emit();
  }
}
