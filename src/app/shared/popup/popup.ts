import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { ConfirmDialogService } from '../../service/confirm-dialog.service';

@Component({
  selector: 'app-popup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './popup.html',
  styleUrl: './popup.css'
})
export class Popup implements OnInit {
  // --- Local Mode ---
  @Input() isVisible: boolean = false;
  @Input() title: string = '';
  @Input() message: string = '';
  @Input() type: 'approve' | 'reject' | 'info' = 'info';
  @Input() confirmButtonText: string = 'Confirm';
  @Input() cancelButtonText: string = 'Cancel';

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  // --- Global Mode ---
  isGlobalVisible = false;
  globalTitle = '';
  globalMessage = '';
  globalConfirmText = '';
  globalCancelText = '';
  globalType: 'approve' | 'reject' | 'info' = 'info';
  private resolveFn?: (result: boolean) => void;

  constructor(private confirmService: ConfirmDialogService) {}

  ngOnInit() {
    this.confirmService.dialogState$.subscribe(data => {
      if (data) {
        this.globalTitle = data.title || 'Confirm';
        this.globalMessage = data.message;
        this.globalConfirmText = data.confirmText || 'Confirm';
        this.globalCancelText = data.cancelText || 'Cancel';
        this.resolveFn = data.resolve;
        
        // Auto-detect aesthetic type for global mode
        const text = this.globalConfirmText.toLowerCase() + this.globalTitle.toLowerCase();
        if (text.includes('deactivate') || text.includes('delete') || text.includes('reject')) {
          this.globalType = 'reject';
        } else if (text.includes('activate') || text.includes('approve')) {
          this.globalType = 'approve';
        } else {
          this.globalType = 'info';
        }

        this.isGlobalVisible = true;
      } else {
        this.isGlobalVisible = false;
      }
    });
  }

  // --- Computed Displays ---
  get displayTitle() { return this.isGlobalVisible ? this.globalTitle : this.title; }
  get displayMessage() { return this.isGlobalVisible ? this.globalMessage : this.message; }
  get displayConfirmText() { return this.isGlobalVisible ? this.globalConfirmText : this.confirmButtonText; }
  get displayCancelText() { return this.isGlobalVisible ? this.globalCancelText : this.cancelButtonText; }
  get currentType() { return this.isGlobalVisible ? this.globalType : this.type; }

  handleConfirm() {
    if (this.isGlobalVisible) {
      this.confirmService.close(true, this.resolveFn);
    } else {
      this.confirm.emit();
    }
  }

  handleCancel() {
    if (this.isGlobalVisible) {
      this.confirmService.close(false, this.resolveFn);
    } else {
      this.cancel.emit();
    }
  }
}
