import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmDialogService } from '../../service/confirm-dialog.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css'
})
export class ConfirmDialogComponent implements OnInit {
  show = false;
  title = 'Confirm';
  message = 'Are you sure?';
  confirmText = 'Confirm';
  cancelText = 'Cancel';
  private resolveFn?: (result: boolean) => void;

  constructor(private confirmService: ConfirmDialogService) {}

  ngOnInit() {
    this.confirmService.dialogState$.subscribe(data => {
      if (data) {
        this.title = data.title || 'Confirm';
        this.message = data.message;
        this.confirmText = data.confirmText || 'Confirm';
        this.cancelText = data.cancelText || 'Cancel';
        this.resolveFn = data.resolve;
        this.show = true;
      } else {
        this.show = false;
      }
    });
  }

  onConfirm() {
    this.confirmService.close(true, this.resolveFn);
  }

  onCancel() {
    this.confirmService.close(false, this.resolveFn);
  }
}
